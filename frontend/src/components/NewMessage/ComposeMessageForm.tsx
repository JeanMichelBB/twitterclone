import React, { useState } from 'react';
import axios from 'axios';

const ComposeMessageForm: React.FC = () => {
  const [recipientUserId, setRecipientUserId] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/messages', {
        recipient_user_id: recipientUserId,
        content: content
      });
      // Optionally, clear the form fields after successful submission
      setRecipientUserId('');
      setContent('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <h2>Compose Message</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="recipientUserId">Recipient User ID:</label>
          <input type="text" id="recipientUserId" value={recipientUserId} onChange={e => setRecipientUserId(e.target.value)} />
        </div>
        <div>
          <label htmlFor="content">Message:</label>
          <textarea id="content" value={content} onChange={e => setContent(e.target.value)} />
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ComposeMessageForm;
