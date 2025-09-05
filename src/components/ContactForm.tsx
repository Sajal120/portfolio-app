import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';

interface ContactFormProps {
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ className }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendEmailNotification = async (name: string, email: string, subject: string, message: string) => {
    try {
      // Check if EmailJS is configured
      const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      
      if (emailjsPublicKey && emailjsServiceId && emailjsPublicKey !== 'your_public_key_here') {
        // Initialize EmailJS with your public key
        emailjs.init(emailjsPublicKey);

        // Send notification to admin
        await emailjs.send(
          emailjsServiceId,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_contact',
          {
            from_name: name,
            from_email: email,
            subject: subject || 'New Contact Form Submission',
            message: message,
            to_email: 'basnetsajal120@gmail.com',
            reply_to: email,
          }
        );

        // Send auto-reply to user
        await emailjs.send(
          emailjsServiceId,
          import.meta.env.VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID || 'template_auto_reply',
          {
            to_name: name,
            to_email: email,
            from_name: 'Sajal Basnet',
            message: `Thank you for contacting me! I have received your message and will get back to you within 24 hours.\n\nYour message:\n"${message}"`,
          }
        );

        console.log('Email notifications sent successfully via EmailJS');
        return { success: true, method: 'emailjs' };
      } else {
        // Fallback to mailto link with simple formatting
        const subjectLine = subject ? `Portfolio Contact: ${subject}` : 'Portfolio Contact Form Submission';
        const body = `${message}

--
From: ${name} (${email})
Sent via Portfolio Contact Form`;

        const mailtoUrl = `mailto:basnetsajal120@gmail.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
        
        // Open user's email client
        window.open(mailtoUrl, '_blank');
        
        console.log('Email notification sent via mailto');
        return { success: true, method: 'mailto' };
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      // Send email notification directly
      const emailResult = await sendEmailNotification(
        formData.name.trim(),
        formData.email.trim(),
        formData.subject.trim(),
        formData.message.trim()
      );

      if (emailResult.success) {
        if (emailResult.method === 'emailjs') {
          toast.success('Thank you! Your message has been sent via email.');
        } else {
          toast.success('Thank you! Your email client will open with your message ready to send.');
        }
      } else {
        toast.error('Failed to prepare your message. Please try again or contact directly via email.');
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`glass-card border-white/10 ${className || ''}`}>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="glass-card border-white/10"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="glass-card border-white/10"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject (optional)"
              className="glass-card border-white/10"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message *
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell me about your project or inquiry..."
              className="glass-card border-white/10 min-h-32"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-glow"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Sending Message...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;