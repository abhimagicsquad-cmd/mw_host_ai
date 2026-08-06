import {
  Cpu,
  Database,
  Gauge,
  HardDrive,
  HeadphonesIcon,
  Lock,
  Mail,
  MousePointerClick,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"

import { CallbackRequestForm } from "@/components/forms/callback-request-form"
import { ContactForm } from "@/components/forms/contact-form"
import { GetQuoteForm } from "@/components/forms/get-quote-form"
import { QuickInquiryForm } from "@/components/forms/quick-inquiry-form"
import { BannerSection } from "@/components/sections/banner-section"
import { ContentSection } from "@/components/sections/content-section"
import { ContactSection } from "@/components/sections/contact-section"
import { CTASection } from "@/components/sections/cta-section"
import { FAQSection } from "@/components/sections/faq-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { HeroSection } from "@/components/sections/hero-section"
import { ImageContentSection } from "@/components/sections/image-content-section"
import { LogoCloud } from "@/components/sections/logo-cloud"
import { NewsletterSection } from "@/components/sections/newsletter-section"
import { PageHero } from "@/components/sections/page-hero"
import { PricingSection } from "@/components/sections/pricing-section"
import { ServiceGrid } from "@/components/sections/service-grid"
import { StatsSection } from "@/components/sections/stats-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { SectionContainer } from "@/components/layout/section-container"
import { SectionHeading } from "@/components/layout/section-heading"

/**
 * Temporary component showcase — NOT one of the site's real routes.
 * Exists only to visually verify the UI foundation renders correctly
 * before real pages are built. Safe to delete once page-building starts.
 */
export default function PreviewPage() {
  return (
    <>
      <BannerSection message="50% off all annual hosting plans this week." cta={{ label: "See offers", href: "#" }} />

      <HeroSection
        eyebrow="Web Hosting"
        title="Hosting that performs 10X faster with MagicWorks Host"
        description="Your trust and website are at the right place. NVMe-powered hosting, free SSL, and 24/7 support included on every plan."
        bullets={[
          "10X faster website loading",
          "One-click script installs",
          "Intuitive cPanel control panel",
          "PHP up to 3x faster than Apache",
        ]}
        primaryCta={{ label: "Choose Right Hosting Plan", href: "#pricing" }}
        secondaryCta={{ label: "Talk to an expert", href: "/contact-us" }}
        stats={[
          { label: "Uptime SLA", value: "99.9%" },
          { label: "Happy customers", value: "12k+" },
          { label: "Avg. load time", value: "0.7s" },
        ]}
      />

      <StatsSection
        title="Web hosting speed = revenue"
        description="Slow sites lose visitors. Here's what switching to NVMe hosting does to real traffic."
        stats={[
          { label: "Faster page loads", value: "10X", icon: Zap },
          { label: "Traffic increase", value: "1000%", icon: Users },
          { label: "Uptime guarantee", value: "99.9%", icon: ShieldCheck },
          { label: "Support availability", value: "24/7", icon: HeadphonesIcon },
        ]}
      />

      <div id="pricing">
        <PricingSection
          eyebrow="Pricing"
          title="Select your web hosting package"
          description="Every plan includes free SSL, cPanel, and JetBackup."
          plans={[
            {
              slug: "starter",
              name: "Starter NVMe",
              price: "₹145",
              priceSuffix: "/mo",
              regularPrice: "₹194",
              discountLabel: "15% off annually",
              features: ["1GB NVMe storage", "5GB bandwidth", "10 email accounts", "Free SSL"],
              cta: { label: "Buy Now", href: "#" },
            },
            {
              slug: "basic-plus",
              name: "Basic Plus NVMe",
              price: "₹407",
              priceSuffix: "/mo",
              regularPrice: "₹542",
              discountLabel: "24% off",
              features: ["50GB NVMe storage", "20GB bandwidth", "30 email accounts", "Free SSL"],
              cta: { label: "Buy Now", href: "#" },
              featured: true,
            },
            {
              slug: "deluxe",
              name: "Deluxe NVMe",
              price: "₹814",
              priceSuffix: "/mo",
              regularPrice: "₹1,085",
              discountLabel: "30% off",
              features: ["150GB NVMe storage", "50GB bandwidth", "100 email accounts", "Free SSL"],
              cta: { label: "Buy Now", href: "#" },
            },
            {
              slug: "unlimited",
              name: "Unlimited NVMe",
              price: "₹1,162",
              priceSuffix: "/mo",
              regularPrice: "₹1,550",
              discountLabel: "25% off",
              features: ["200GB NVMe storage", "200GB bandwidth", "Unlimited email", "Free SSL"],
              cta: { label: "Buy Now", href: "#" },
            },
          ]}
        />
      </div>

      <WhyChooseUs
        title="Why choose MagicWorks Host"
        description="Everything you need to manage your website with a single click."
        reasons={[
          { title: "Easy to manage", description: "Full cPanel access with a clean, modern UI.", icon: MousePointerClick },
          { title: "Unlimited email accounts", description: "Business-grade email on every plan.", icon: Mail },
          { title: "150+ one-click scripts", description: "Softaculous installs for WordPress and more.", icon: Rocket },
          { title: "Quick loading", description: "NVMe storage on every server, every plan.", icon: Gauge },
          { title: "Unlimited MySQL databases", description: "Scale your apps without extra fees.", icon: Database },
          { title: "24/7 expert support", description: "Real humans, every day of the year.", icon: HeadphonesIcon },
        ]}
      />

      <ServiceGrid
        eyebrow="Services"
        title="Everything your website needs"
        description="From domains to dedicated servers — one provider, one dashboard."
        services={[
          {
            slug: "vps",
            title: "VPS Hosting",
            description: "Dedicated resources with full root access.",
            icon: Server,
            href: "/vps-hosting",
            price: "₹4,372",
            priceSuffix: "/mo",
            featured: true,
          },
          {
            slug: "dedicated",
            title: "Dedicated Servers",
            description: "Bare-metal performance for high-traffic sites.",
            icon: Cpu,
            href: "/dedicated-hosting/dedicated-server",
            price: "₹13,769",
            priceSuffix: "/mo",
          },
          {
            slug: "ssl",
            title: "SSL Certificates",
            description: "Secure your site and boost customer trust.",
            icon: Lock,
            href: "/ssl",
            price: "₹4,000",
            priceSuffix: "/yr",
          },
        ]}
      />

      <ImageContentSection
        eyebrow="About Us"
        title="A decade of powering websites that perform"
        description="Magic Works Host is a division of MagicWorks IT Solutions, serving customers since 2012 with hosting infrastructure that just works."
        bullets={["Manage everything with a single click", "24/7 call and ticket support", "Trusted by 12,000+ businesses"]}
        cta={{ label: "Learn more about us", href: "/about-us" }}
        image={{ src: "/images/placeholder-photo.svg", alt: "MagicWorks Host team" }}
      />

      <TestimonialsSection
        title="What our customers say"
        testimonials={[
          {
            name: "Anita Sharma",
            title: "Founder",
            company: "Craftly Studio",
            quote: "Migration was seamless and our site has never been faster. Support responds within minutes.",
            rating: 5,
          },
          {
            name: "Rohit Verma",
            title: "CTO",
            company: "Bharat Retail Co.",
            quote: "NVMe hosting cut our page load time in half. Couldn't be happier with the switch.",
            rating: 5,
          },
          {
            name: "Priya Nair",
            title: "Marketing Lead",
            company: "Nair & Co.",
            quote: "The cPanel setup is intuitive even for our non-technical team members.",
            rating: 4,
          },
        ]}
      />

      <LogoCloud
        logos={Array.from({ length: 6 }, (_, index) => ({
          name: `Partner ${index + 1}`,
          logoUrl: "/images/placeholder-logo.svg",
        }))}
      />

      <FAQSection
        title="Frequently asked questions"
        items={[
          { question: "How fast can I get started?", answer: "Most accounts are provisioned within 5 minutes of payment confirmation." },
          { question: "Do you offer a money-back guarantee?", answer: "Yes — every plan includes a 30-day money-back guarantee." },
          { question: "Can I upgrade my plan later?", answer: "Absolutely, upgrades are instant and prorated from your control panel." },
        ]}
      />

      <ContentSection title="Our story" description="How MagicWorks Host got started.">
        <p>
          Founded in 2012, MagicWorks Host set out to make enterprise-grade hosting infrastructure accessible to
          small businesses across India.
        </p>
        <h3>What sets us apart</h3>
        <p>NVMe storage, transparent pricing, and support engineers who actually pick up the phone.</p>
      </ContentSection>

      <ContactSection title="Get in touch" description="We usually reply within a few hours.">
        <ContactForm />
      </ContactSection>

      <SectionContainer background="alt" width="wide">
        <SectionHeading title="More form patterns" description="Same reusable field components, different shapes." />
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-border-alt bg-background p-6">
            <p className="mb-4 font-heading font-semibold text-brand-navy">Quick Inquiry</p>
            <QuickInquiryForm />
          </div>
          <div className="rounded-2xl border border-border-alt bg-background p-6">
            <p className="mb-4 font-heading font-semibold text-brand-navy">Get a Quote</p>
            <GetQuoteForm />
          </div>
          <div className="rounded-2xl border border-border-alt bg-background p-6">
            <p className="mb-4 font-heading font-semibold text-brand-navy">Request a Callback</p>
            <CallbackRequestForm />
          </div>
        </div>
      </SectionContainer>

      <NewsletterSection />

      <CTASection
        title="Ready to move your website to MagicWorks Host?"
        description="Free migration assistance on every annual plan."
        primaryCta={{ label: "View Plans", href: "#pricing" }}
        secondaryCta={{ label: "Talk to sales", href: "/contact-us" }}
      />

      <PageHero
        title="Example interior page hero"
        description="This is how PageHero looks on a product or company page."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Hosting", href: "/hosting" }, { label: "VPS Hosting" }]}
        cta={{ label: "Compare Plans", href: "/compare-hosting-plans" }}
      />

      <FeaturesSection
        title="Layout building blocks recap"
        description="SectionContainer + SectionHeading power every section above."
        columns={3}
        features={[
          { title: "Consistent spacing", description: "One container component, every section aligned.", icon: Sparkles },
          { title: "Themeable", description: "Brand tokens driven from Tailwind CSS variables.", icon: Gauge },
          { title: "Composable", description: "Sections accept typed props — ready for CMS data.", icon: HardDrive },
        ]}
      />
    </>
  )
}
