import Participant from '../models/Participant.js';
import Workshop from '../models/Workshop.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';
import Notification from '../models/Notification.js';

// ── GET /api/certificates/:workshopId — Generate PDF certificate ──────────────
export const generateCertificate = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const userId = req.user._id;

    // Verify attendance
    const participant = await Participant.findOne({ workshopId, userId });
    if (!participant) {
      return res.status(403).json({ message: 'You are not enrolled in this workshop' });
    }
    if (participant.status !== 'attended' && participant.status !== 'partial') {
      return res.status(403).json({ message: 'Certificate available only for attendees' });
    }

    const [workshop, user] = await Promise.all([
      Workshop.findById(workshopId).populate('creatorId', 'name'),
      User.findById(userId).select('name'),
    ]);

    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    // ── Build PDF ─────────────────────────────────────────────────────────────
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="CastNcart-Certificate-${workshopId}.pdf"`
    );
    doc.pipe(res);

    const W = 841.89, H = 595.28; // A4 landscape in pts

    // Background gradient (deep navy)
    doc.rect(0, 0, W, H).fill('#0f172a');

    // Gold border frame
    const BORDER = 28;
    doc.rect(BORDER, BORDER, W - BORDER * 2, H - BORDER * 2)
       .lineWidth(3).strokeColor('#c9a84c').stroke();
    doc.rect(BORDER + 6, BORDER + 6, W - (BORDER + 6) * 2, H - (BORDER + 6) * 2)
       .lineWidth(1).strokeColor('#c9a84c').stroke();

    // Top decorative line
    doc.moveTo(BORDER + 40, BORDER + 40).lineTo(W - BORDER - 40, BORDER + 40)
       .lineWidth(1).strokeColor('#c9a84c').stroke();

    // Platform name
    doc.font('Helvetica-Bold')
       .fontSize(13)
       .fillColor('#c9a84c')
       .text('CAST N CART', 0, BORDER + 50, { align: 'center', characterSpacing: 8 });

    // Title
    doc.font('Helvetica')
       .fontSize(11)
       .fillColor('#94a3b8')
       .text('CERTIFICATE OF COMPLETION', 0, BORDER + 75, { align: 'center', characterSpacing: 4 });

    // Divider
    doc.moveTo(W / 2 - 60, BORDER + 96).lineTo(W / 2 + 60, BORDER + 96)
       .lineWidth(0.5).strokeColor('#c9a84c').stroke();

    // "This certifies that"
    doc.font('Helvetica-Oblique')
       .fontSize(13)
       .fillColor('#cbd5e1')
       .text('This certifies that', 0, BORDER + 115, { align: 'center' });

    // Recipient name
    doc.font('Helvetica-Bold')
       .fontSize(36)
       .fillColor('#ffffff')
       .text(user.name, 0, BORDER + 140, { align: 'center' });

    // Underline below name
    const nameWidth = Math.min(doc.widthOfString(user.name, { fontSize: 36 }) + 60, 400);
    doc.moveTo(W / 2 - nameWidth / 2, BORDER + 190)
       .lineTo(W / 2 + nameWidth / 2, BORDER + 190)
       .lineWidth(1).strokeColor('#c9a84c').stroke();

    // Has successfully completed
    doc.font('Helvetica')
       .fontSize(13)
       .fillColor('#cbd5e1')
       .text('has successfully completed the workshop', 0, BORDER + 203, { align: 'center' });

    // Workshop title
    doc.font('Helvetica-Bold')
       .fontSize(22)
       .fillColor('#f8fafc')
       .text(`"${workshop.title}"`, 0, BORDER + 230, { align: 'center' });

    // Category + duration
    const completedDate = participant.leaveTime
      ? new Date(participant.leaveTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date(workshop.scheduledDate || workshop.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    doc.font('Helvetica')
       .fontSize(11)
       .fillColor('#94a3b8')
       .text(
         `Category: ${workshop.category}  ·  Duration: ${workshop.durationMinutes} mins  ·  Completed: ${completedDate}`,
         0, BORDER + 268, { align: 'center' }
       );

    // Bottom divider
    doc.moveTo(BORDER + 40, H - BORDER - 90)
       .lineTo(W - BORDER - 40, H - BORDER - 90)
       .lineWidth(0.5).strokeColor('#334155').stroke();

    // Signature area
    const sigY = H - BORDER - 78;

    // Instructor side
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#ffffff')
       .text(workshop.creatorId?.name || 'Instructor', BORDER + 60, sigY, { width: 200, align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor('#64748b')
       .text('Workshop Instructor', BORDER + 60, sigY + 16, { width: 200, align: 'center' });

    // Platform side
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#ffffff')
       .text('Cast N Cart', W - BORDER - 260, sigY, { width: 200, align: 'center' });
    doc.font('Helvetica').fontSize(9).fillColor('#64748b')
       .text('Platform Authority', W - BORDER - 260, sigY + 16, { width: 200, align: 'center' });

    // Certificate ID
    doc.font('Helvetica').fontSize(8).fillColor('#334155')
       .text(
         `Certificate ID: CNC-${workshopId.toString().slice(-8).toUpperCase()}-${userId.toString().slice(-6).toUpperCase()}`,
         0, H - BORDER - 30, { align: 'center' }
       );

    doc.end();

    // Create a certificate-ready notification (fire-and-forget)
    Notification.create({
      userId,
      type: 'certificate_ready',
      title: `Your certificate for "${workshop.title}" is ready!`,
      message: 'You can download your certificate of completion from your dashboard.',
      link: `/dashboard/user`,
    }).catch(() => {});

  } catch (error) {
    console.error('Certificate generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};
