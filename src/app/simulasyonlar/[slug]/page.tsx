import { notFound } from 'next/navigation';
import { findSimBySlug, PHET_REGISTRY } from '@/lib/phet-registry';
import SimulationDetailClient from '@/components/simulations/SimulationDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PHET_REGISTRY.map((sim) => ({ slug: sim.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const sim = findSimBySlug(slug);
  if (!sim) return { title: 'Simülasyon Bulunamadı' };
  return {
    title: `${sim.title_tr} | YKS Yıldızı Simülasyonlar`,
    description: sim.description,
    keywords: [...sim.related_yks_topics, sim.subject, 'PhET', 'YKS', 'simülasyon'].join(', '),
  };
}

export default async function SimulationSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const sim = findSimBySlug(slug);
  if (!sim) notFound();
  return <SimulationDetailClient sim={sim} />;
}
