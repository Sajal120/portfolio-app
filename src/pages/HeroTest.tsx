import React, { useEffect, useState } from 'react';
import { getHeroContent, HeroContent } from '../lib/supabase';

const HeroTest: React.FC = () => {
  const [heroData, setHeroData] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await getHeroContent();
        if (error) {
          setError(error.message);
        } else {
          setHeroData(data);
        }
      } catch (err) {
        setError('Failed to load hero content');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Hero Content Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold">Raw Database Data:</h2>
        <pre className="text-sm">{JSON.stringify(heroData, null, 2)}</pre>
      </div>

      <div className="bg-blue-100 p-4 rounded">
        <h2 className="font-bold">Rendered Description:</h2>
        <div className="mt-2">
          {heroData?.description && <div>Main: {heroData.description}</div>}
          {heroData?.sub_description && <div>Sub: {heroData.sub_description}</div>}
        </div>
      </div>

      <div className="bg-green-100 p-4 rounded">
        <h2 className="font-bold">How it should appear:</h2>
        <p>
          {heroData?.description || 'Developer | Analyst | IT Support Specialist.'}
          <br />
          {heroData?.sub_description || 'Leveraging AI tools to enhance development workflows, security analysis, and system optimization. Creating efficient, intelligent solutions.'}
        </p>
      </div>
    </div>
  );
};

export default HeroTest;