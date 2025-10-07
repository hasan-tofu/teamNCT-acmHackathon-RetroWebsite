
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-retro-dark flex flex-col items-center justify-center p-4 text-center">
            <header className="pixel-border border-retro-cyan border-4 p-8 bg-retro-blue mb-8 animate-float">
                <h1 className="text-5xl md:text-7xl font-press-start text-retro-yellow mb-4">
                    ACM-UDST ARCADE
                </h1>
                <p className="text-xl md:text-2xl font-vt323 text-retro-white">
                    LEVEL UP YOUR TECH JOURNEY
                </p>
            </header>

            <main className="w-full max-w-lg">
                <div className="pixel-border border-retro-pink border-4 p-6 bg-retro-purple mb-8">
                    <p className="font-vt323 text-2xl text-retro-white leading-relaxed">
                        Join the premier student chapter for computing. Attend workshops, compete in challenges, and earn XP and badges. Are you ready, player one?
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button onClick={() => navigate('/login')} variant="primary" className="w-full sm:w-auto text-lg px-8 py-4">
                        LOGIN
                    </Button>
                    <Button onClick={() => navigate('/signup')} variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4">
                        SIGN UP
                    </Button>
                </div>
            </main>

            <footer className="mt-12 text-retro-purple font-vt323 text-lg">
                <p>&copy; 2024 ACM UDST Student Chapter. Insert Coin to Continue.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
