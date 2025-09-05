import { useEffect, useState } from 'react';

interface SimpleLoadingProps {
  onComplete: () => void;
}

const SimpleLoading = ({ onComplete }: SimpleLoadingProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Sajal
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI & IT Enthusiast
        </p>
        
        <div className="w-64 mx-auto">
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-primary mt-2">{progress}%</div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          Initializing development environment...
        </p>
      </div>
    </div>
  );
};

export default SimpleLoading;