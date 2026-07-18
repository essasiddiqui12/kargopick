import ContactForm from "@/components/ContactForm";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: `Contact Us | ${BRAND_NAME}`,
  description: `Get in touch with ${BRAND_NAME}. We're here to help with orders, product queries, and support.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <ContactForm />
    </div>
  );
}
