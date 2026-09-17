import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretskillspherekey_2026';

// Customer: John Doe (_id: '6aa3a4ed8e3b2d93bb7607fc', email: 'john@gmail.com', role: 'User')
const customerToken = jwt.sign(
  { id: '6aa3a4ed8e3b2d93bb7607fc', role: 'User' },
  JWT_SECRET,
  { expiresIn: '1d' }
);

// Creator: Anusuyadevi (_id: '6a97a8856e8edadb3e451252', email: '2312005@nec.edu.in', role: 'Creator')
const creatorToken = jwt.sign(
  { id: '6a97a8856e8edadb3e451252', role: 'Creator' },
  JWT_SECRET,
  { expiresIn: '1d' }
);

async function runTests() {
  console.log('====================================================');
  console.log('CASTNCART ASSISTANT END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  // Test 1: Guest User & Quick Actions
  console.log('1. Testing Guest Quick Actions:');
  const r1 = await axios.get(`${BASE}/chatbot/quick-actions`);
  console.log('   Status:', r1.status, '| Role:', r1.data.role, '| Actions:', r1.data.actions.map(a => a.label).join(', '));

  // Test 2: Customer Login Quick Actions
  console.log('\n2. Testing Customer Quick Actions:');
  const r2 = await axios.get(`${BASE}/chatbot/quick-actions`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  console.log('   Status:', r2.status, '| Role:', r2.data.role, '| Actions:', r2.data.actions.map(a => a.label).join(', '));

  // Test 3: Creator Login Quick Actions
  console.log('\n3. Testing Creator Quick Actions:');
  const r3 = await axios.get(`${BASE}/chatbot/quick-actions`, {
    headers: { Authorization: `Bearer ${creatorToken}` }
  });
  console.log('   Status:', r3.status, '| Role:', r3.data.role, '| Actions:', r3.data.actions.map(a => a.label).join(', '));

  // Test 4: Customer Product Search
  console.log('\n4. Testing Product Search ("Show me painting products"):');
  const r4 = await axios.post(`${BASE}/chatbot/message`, {
    message: 'Show me painting products'
  }, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  console.log('   Response:', r4.data.text);
  console.log('   Cards found:', r4.data.cards?.length, r4.data.cards?.map(c => `[${c.title} - ₹${c.price}]`).join(', '));

  // Test 5: Customer Workshop Search
  console.log('\n5. Testing Workshop Search ("What workshops are available?"):');
  const r5 = await axios.post(`${BASE}/chatbot/message`, {
    message: 'What workshops are available?'
  }, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  console.log('   Response:', r5.data.text);
  console.log('   Workshops found:', r5.data.cards?.length, r5.data.cards?.map(c => `[${c.title} - ${c.price}]`).join(', '));

  // Test 6: Customer Order Lookup
  console.log('\n6. Testing Customer Order Lookup ("Show my orders"):');
  const r6 = await axios.post(`${BASE}/chatbot/message`, {
    message: 'Show my orders'
  }, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  console.log('   Response:', r6.data.text);
  console.log('   Orders:', r6.data.cards?.map(c => `[Order #${c.shortId}: ${c.items} - ${c.totalAmount}]`).join(', '));

  // Test 7: Customer Cart
  console.log('\n7. Testing Customer Cart ("How much is my cart?"):');
  const mockCart = [
    { id: '6a99000e3f2071f00aab87db', title: 'soap', price: 50, quantity: 2 },
    { id: '6a9fe7af10380679866ae047', title: 'HandMade brush process', price: 15, quantity: 1 }
  ];
  const r7 = await axios.post(`${BASE}/chatbot/message`, {
    message: 'How much is my cart?',
    cart: mockCart
  }, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  console.log('   Response:', r7.data.text);
  console.log('   Calculated Cart Total:', r7.data.cartTotal);

  // Test 8: Creator Workshop Lookup
  console.log('\n8. Testing Creator Workshop Lookup ("Show my workshops"):');
  const r8 = await axios.post(`${BASE}/chatbot/message`, {
    message: 'Show my workshops'
  }, {
    headers: { Authorization: `Bearer ${creatorToken}` }
  });
  console.log('   Response:', r8.data.text);
  console.log('   Workshops:', r8.data.cards?.map(c => `[${c.title} - Enrolled: ${c.participants}]`).join(', '));

  // Test 9: Creator Product Lookup
  console.log('\n9. Testing Creator Product Lookup ("Show my products"):');
  const r9 = await axios.post(`${BASE}/chatbot/message`, {
    message: 'Show my products'
  }, {
    headers: { Authorization: `Bearer ${creatorToken}` }
  });
  console.log('   Response:', r9.data.text);
  console.log('   Products:', r9.data.cards?.map(c => `[${c.title} - Stock: ${c.stock}]`).join(', '));

  // Test 10: Creator Attendance
  console.log('\n10. Testing Creator Attendance ("Show attendance for my workshops"):');
  const r10 = await axios.post(`${BASE}/chatbot/message`, {
    message: 'Show attendance for my workshops'
  }, {
    headers: { Authorization: `Bearer ${creatorToken}` }
  });
  console.log('   Response:', r10.data.text);
  console.log('   Attendance rows:', JSON.stringify(r10.data.attendanceRows));

  // Test 11: Creator Revenue
  console.log('\n11. Testing Creator Revenue ("Show my revenue"):');
  const r11 = await axios.post(`${BASE}/chatbot/message`, {
    message: 'Show my revenue'
  }, {
    headers: { Authorization: `Bearer ${creatorToken}` }
  });
  console.log('   Response:', r11.data.text);

  // Test 12: Role-based Security
  console.log('\n12. Testing Role Security (Customer asking for creator revenue & attendance):');
  const r12a = await axios.post(`${BASE}/chatbot/message`, {
    message: 'Show my revenue'
  }, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  console.log('   Customer asks for revenue:', r12a.data.text);

  const r12b = await axios.post(`${BASE}/chatbot/message`, {
    message: 'Show attendance for my workshops'
  }, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  console.log('   Customer asks for attendance:', r12b.data.text);

  const r12c = await axios.post(`${BASE}/chatbot/message`, {
    message: 'Show my orders'
  }); // Guest without token
  console.log('   Guest asks for orders:', r12c.data.text);

  // Daily Puzzle & Hint
  console.log('\n13. Testing Daily Puzzle & Hint:');
  const r13 = await axios.post(`${BASE}/chatbot/message`, {
    message: 'Give me a hint for daily puzzle'
  });
  console.log('   Hint Response:', r13.data.text);

  console.log('\n====================================================');
  console.log('ALL BACKEND API TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test failed:', err.response?.data || err.message);
  process.exit(1);
});
