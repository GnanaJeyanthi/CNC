import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function WorkshopDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/workshops/${id}`);
        setWorkshop(data);
      } catch(err) { console.error(err); }
    }
    fetchWorkshop();
  }, [id]);

  const handleEnroll = async () => {
    if(!user) return navigate('/signin');
    try {
      if (workshop.price > 0) {
        await axios.post('http://localhost:5000/api/orders', {
          items: [{ itemModel: 'Workshop', itemId: id, quantity: 1 }]
        }, { headers: { Authorization: `Bearer ${user.token}` } });
      } else {
        await axios.post(`http://localhost:5000/api/workshops/${id}/join`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      alert('Successfully enrolled!');
      navigate('/dashboard/user');
    } catch(err) {
      alert(err.response?.data?.message || 'Error joining');
    }
  }

  if(!workshop) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto px-4 w-full py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            <div className="h-64 md:h-96 bg-gray-200 rounded-2xl overflow-hidden mb-6">
               {workshop.thumbnailUrl && <img src={workshop.thumbnailUrl} alt={workshop.title} className="w-full h-full object-cover" />}
            </div>
            <h1 className="text-4xl font-bold mb-4">{workshop.title}</h1>
            <p className="text-gray-600 mb-8">{workshop.description}</p>
            
            {workshop.learningObjectives && workshop.learningObjectives.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {workshop.learningObjectives.map((obj, i) => (
                    <li key={i} className="text-gray-700">{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-1/3">
            <div className="bg-slate-50 p-6 rounded-2xl border sticky top-24">
              <div className="text-3xl font-bold mb-4">{workshop.price === 0 ? 'Free' : `$${workshop.price}`}</div>
              <button onClick={handleEnroll} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow mb-4">
                Enroll Now
              </button>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between"><span>Date:</span> <span className="font-semibold">{workshop.scheduledDate ? new Date(workshop.scheduledDate).toLocaleDateString() : 'TBA'}</span></div>
                <div className="flex justify-between"><span>Time:</span> <span className="font-semibold">{workshop.scheduledDate ? new Date(workshop.scheduledDate).toLocaleTimeString() : 'TBA'}</span></div>
                <div className="flex justify-between"><span>Duration:</span> <span className="font-semibold">{workshop.durationMinutes} mins</span></div>
                <div className="flex justify-between"><span>Category:</span> <span className="font-semibold">{workshop.category}</span></div>
                <div className="flex justify-between"><span>Host:</span> <span className="font-semibold">{workshop.creatorId?.name}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
