# Health Insurance Inc. - Frontend

A modern, responsive healthcare chatbot interface built with React.

## Features

- 🎨 Clean, professional UI matching healthcare industry standards
- 💬 Interactive AI chatbot for healthcare assistance
- 📱 Fully responsive design (mobile, tablet, desktop)
- ⚡ Fast and lightweight
- 🔒 Privacy-focused design

## Quick Start

### Installation

```bash
cd frontend
npm install
```

### Running the Application

```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ChatInterface.js
│   │   └── ChatInterface.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Features Overview

### Header Navigation
- Top navigation bar with Medicare, Individual & Family, Medicaid links
- Main navigation with Shop Insurance, Member Resources
- Find a Doctor feature
- Search functionality

### Hero Section
- Eye-catching headline: "Health plans for life's moments"
- Call-to-action buttons:
  - Shop for a plan
  - Member sign in
- Animated family illustration

### Chat Interface
- Floating chat button in bottom-right corner
- Expandable chat window
- AI-powered responses for:
  - Appointment scheduling
  - Insurance benefits inquiries
  - Finding doctors
  - Prescription refills
  - Claims information
- Quick action buttons for common tasks
- Typing indicators
- Message timestamps
- Smooth animations

## Chatbot Capabilities

The healthcare chatbot can assist with:

1. **Appointments**
   - Schedule new appointments
   - Cancel existing appointments
   - View available time slots

2. **Insurance Coverage**
   - Check benefits
   - Understand deductibles
   - Prescription coverage info

3. **Provider Search**
   - Find nearby doctors
   - Change primary care provider

4. **Prescriptions**
   - Refill medications
   - Pharmacy information

5. **Claims**
   - Check claim status
   - Submit new claims

## Customization

### Colors
The main brand colors are defined in the CSS:
- Primary Blue: `#002677`
- Secondary Blue: `#0044cc`
- Accent Orange: `#ff6600`
- Background: `#f0f8ff`

### Chatbot Responses
To customize bot responses, edit the `getBotResponse()` function in `src/components/ChatInterface.js`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

- **React 18.2.0** - UI framework
- **CSS3** - Styling with animations
- **JavaScript ES6+** - Modern JavaScript

## Future Enhancements

- Backend API integration
- User authentication
- Real-time chat with WebSocket
- Voice input support
- Multi-language support
- Analytics dashboard

## Development

### Available Scripts

- `npm start` - Run development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Notes

This is a UI mockup. Most buttons are non-functional by design (except the chat interface). The chatbot provides simulated responses for demonstration purposes.

## License

MIT License - Created for hackNYU-LM10 project

---

Built with ❤️ for better healthcare experiences
