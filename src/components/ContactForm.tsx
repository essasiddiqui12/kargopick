"use client";

import { Mail, Phone, MapPin, Clock, MessageCircle, User } from "lucide-react";
import { BRAND_EMAIL } from "@/lib/brand";
import { formatWhatsAppDisplay, getWhatsAppUrl, buildEnquiryMessage } from "@/lib/whatsapp";

export default function ContactForm() {
  const whatsappUrl = getWhatsAppUrl(buildEnquiryMessage());
  const phoneDisplay = formatWhatsAppDisplay();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
        Get in Touch
      </h1>
      <p className="mt-3 text-base text-surface-600">
        We are here to assist you with your fitness journey and shopping needs. Whether you have questions about a product or need help with an order, feel free to reach out to us.
      </p>

      <div className="mt-4 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-surface-900">Kargopick International</h2>
        <div className="mt-3 grid gap-3 text-sm text-surface-700">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-brand-600 mt-0.5" />
            <span><span className="font-medium">Proprietor:</span> Mohammad Hamid Shaikh</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-brand-600 mt-0.5" />
            <span>112, Keshavji Building, Yusuf Meher Ali Road, Masjid Bunder, Mumbai, Maharashtra - 400003</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-600" />
            <a href="tel:+917400354678" className="hover:text-brand-700">+91 7400354678</a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-600" />
            <a href={`mailto:${BRAND_EMAIL}`} className="hover:text-brand-700">{BRAND_EMAIL}</a>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-600" />
            <span>Monday to Saturday, 10:00 AM – 7:00 PM</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-surface-100">
          <p className="text-sm font-medium text-surface-700">Stay Connected</p>
          <p className="text-xs text-surface-500 mt-1">
            Follow us on Instagram for the latest imports, new arrivals, and special deals!
          </p>
          <a
            href="https://www.instagram.com/kargopick_international/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            @kargopick_international
          </a>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-surface-200 bg-surface-50 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-surface-900">Send Us a Message</h2>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); alert("This is a demo contact form. Please reach out via WhatsApp or email for now."); }}>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-surface-700 mb-1">Full Name</label>
            <input required className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" placeholder="Your name" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-surface-700 mb-1">Phone Number</label>
            <input required className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" placeholder="9876543210" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
            <input required type="email" className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" placeholder="you@example.com" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-1">Message</label>
            <textarea required rows={4} className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-surface-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" placeholder="How can we help you?" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
              Send Message
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-6">
        <div>
          <p className="text-sm font-medium text-surface-500">Prefer instant support?</p>
          <p className="text-lg font-bold text-surface-900">Chat with us on WhatsApp.</p>
        </div>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20bd5a]">
          <MessageCircle className="h-4 w-4" />
          Open WhatsApp
        </a>
      </div>
    </div>
  );
}
