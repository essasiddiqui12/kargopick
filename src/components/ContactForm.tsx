"use client";

import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { BRAND_EMAIL } from "@/lib/brand";
import { formatWhatsAppDisplay, getWhatsAppUrl, buildEnquiryMessage } from "@/lib/whatsapp";

export default function ContactForm() {
  const whatsappUrl = getWhatsAppUrl(buildEnquiryMessage());
  const phoneDisplay = formatWhatsAppDisplay();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
        Contact Us
      </h1>
      <p className="mt-3 text-base text-surface-600">
        Have a question about an order, product, or partnership? Reach out and we’ll get back to you as soon as possible.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">Email</p>
              <p className="text-sm font-semibold text-surface-900">{BRAND_EMAIL}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-surface-500">
            For order issues, product questions, or business inquiries.
          </p>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">WhatsApp</p>
              <p className="text-sm font-semibold text-surface-900">{phoneDisplay}</p>
            </div>
          </div>
          <div className="mt-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#20bd5a]"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">Support Hours</p>
              <p className="text-sm font-semibold text-surface-900">Mon – Sat, 10:00 AM – 7:00 PM</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-surface-500">
            Response time is usually within a few hours during business hours.
          </p>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">Location</p>
              <p className="text-sm font-semibold text-surface-900">India</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-surface-500">
            We ship pan-India from our trusted logistics network.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-surface-200 bg-surface-50 p-6 sm:p-8">
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

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-surface-200 bg-surface-50 p-6">
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
