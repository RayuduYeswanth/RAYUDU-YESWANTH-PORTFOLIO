async function seedData() {
  if (!confirm('Seed will overwrite profile, education, skills, projects, and certifications. Continue?')) return;

  const batch1 = db.batch();

  // Profile
  batch1.set(db.collection('profile').doc('main'), {
    name: 'Rayudu Yeswanth Chandra Sekhar',
    title: 'VLSI Design & Embedded Systems Enthusiast',
    tagline: 'Building tomorrow\'s circuits, today.',
    bio: 'Electronics & Communication Engineering student at Sri Manakula Vinayagar Engineering College, Puducherry. Passionate about VLSI design, embedded systems, and semiconductor technology. Actively pursuing hands-on projects and certifications to bridge academics with industry.',
    email: 'ryeswanthbraptcy@gmail.com',
    phone: '+91 93980 52655',
    location: 'Yanam – 533464, Andhra Pradesh',
    languages: ['English', 'Telugu', 'Tamil'],
    socialLinks: { linkedin: '', github: '', twitter: '', instagram: '' },
    profilePhotoURL: '',
    cvURL: ''
  });

  // Settings
  batch1.set(db.collection('settings').doc('site'), {
    footerText: '© 2025 Rayudu Yeswanth. All rights reserved.',
    analyticsEnabled: false
  });

  await batch1.commit();

  // Education — sequential to avoid large batch
  const eduCol = db.collection('education');
  await eduCol.add({ degree: 'B.Tech ECE', institution: 'Sri Manakula Vinayagar Engineering College, Puducherry', year: '2024–2027', status: 'pursuing', order: 1 });
  await eduCol.add({ degree: 'Diploma ECE', institution: 'Dr. B.R. Ambedkar Polytechnic College, Yanam', year: '2024', status: 'completed', order: 2 });
  await eduCol.add({ degree: 'High School (SSC)', institution: 'Sarada Vidya Niketan Govt. Aided High School, Yanam', year: '2021', status: 'completed', order: 3 });

  // Skills
  const skillsCol = db.collection('skills');
  await skillsCol.add({ groupName: 'VLSI / Digital', order: 1, items: ['Verilog', 'VHDL', 'RTL Design', 'FSMs', 'FPGA'] });
  await skillsCol.add({ groupName: 'EDA Tools', order: 2, items: ['Xilinx Vivado', 'ModelSim', 'Cadence', 'Cadre TCAD'] });
  await skillsCol.add({ groupName: 'Circuit Design', order: 3, items: ['Proteus', 'Multisim', 'LTspice'] });
  await skillsCol.add({ groupName: 'Embedded Systems', order: 4, items: ['Arduino', '8051', 'Embedded C', 'Keil µVision'] });
  await skillsCol.add({ groupName: 'Programming', order: 5, items: ['C', 'Embedded C', 'Python', 'MATLAB'] });
  await skillsCol.add({ groupName: 'Electronics Core', order: 6, items: ['Logic Design', 'Op-Amps', 'ADC/DAC'] });

  // Projects
  const projCol = db.collection('projects');
  await projCol.add({ title: 'Vehicle Speed Control Using Road Safety Sign Boards', description: 'RFID-based system that controls vehicle speed in restricted zones like schools and hospitals using automation.', techTags: ['RFID', 'Arduino', 'Embedded C', 'Automation'], category: 'Embedded', order: 1, imageURLs: [], videoURL: '', githubURL: '', demoURL: '', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  await projCol.add({ title: 'Battery Level Indicator Using LEDs', description: 'Analog indicator circuit using voltage-level detection and LED arrays for real-time battery status display.', techTags: ['Analog', 'LED', 'Circuit Design', 'LM3914'], category: 'Electronics', order: 2, imageURLs: [], videoURL: '', githubURL: '', demoURL: '', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  await projCol.add({ title: 'Temperature Monitoring System with LM35', description: 'Real-time temperature sensing and digital display using Arduino and the LM35 analog temperature sensor.', techTags: ['Arduino', 'LM35', 'Sensor', 'C'], category: 'Arduino', order: 3, imageURLs: [], videoURL: '', githubURL: '', demoURL: '', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  await projCol.add({ title: 'Automatic Street Light Controller', description: 'LDR-based automatic switching system that detects ambient light and controls street lights day/night.', techTags: ['LDR', 'Relay', 'Electronics', 'Automation'], category: 'Electronics', order: 4, imageURLs: [], videoURL: '', githubURL: '', demoURL: '', createdAt: firebase.firestore.FieldValue.serverTimestamp() });

  // Certifications
  const certCol = db.collection('certifications');
  await certCol.add({ title: 'Semiconductor Devices Simulation using Cadre VisualTCAD', issuer: 'CMR Institute of Technology (NAAC A++)', date: 'April 2026', badgeType: 'TCAD', imageURL: '', order: 1 });
  await certCol.add({ title: 'Digital System Design Using Altera FPGAs', issuer: 'IEEE IES Student Chapter, Anna University MIT Campus', date: 'August 2025', badgeType: 'FPGA', imageURL: '', order: 2 });
  await certCol.add({ title: "EVOLIX'26 Technical Symposium", issuer: 'Vels Institute of Science Technology & Advanced Studies', date: 'March 2026', badgeType: 'AI', imageURL: '', order: 3 });
  await certCol.add({ title: 'Introduction to Industry 4.0 & IIoT', issuer: 'NPTEL — Government of India', date: 'April 2025', badgeType: 'NPTEL', imageURL: '', order: 4 });

  alert('Seed complete! Refresh the dashboard.');
}
