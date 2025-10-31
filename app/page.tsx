import Hero from '../components/Hero';
import { RoiCalculator } from '../components/RoiCalculator';

export default function Page(){
  return (
    <main>
      <Hero />
      <div className="container">
        <div className="section">
          <RoiCalculator />
        </div>
      </div>
    </main>
  );
}
