import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar      from '../components/Navbar';
import Footer      from '../components/Footer';
import PlanCard    from '../components/PlanCard';
import FeedbackCard from '../components/FeedbackCard';
import api         from '../utils/api';

function BMICalculator() {
  const [form,   setForm]   = useState({ height: '', weight: '', gender: 'male' });
  const [result, setResult] = useState(null);
  const calculate = () => {
    const h = parseFloat(form.height) / 100;
    const w = parseFloat(form.weight);
    if (!h || !w) return toast.error('Please enter height and weight');
    const bmi = (w / (h * h)).toFixed(1);
    let category, suggest, color;
    if      (bmi < 18.5) { category = 'Underweight';   suggest = 'Weight Gain';  color = 'text-blue-400'; }
    else if (bmi < 25)   { category = 'Normal Weight'; suggest = 'Maintenance';  color = 'text-green-400'; }
    else if (bmi < 30)   { category = 'Overweight';    suggest = 'Weight Loss';  color = 'text-yellow-400'; }
    else                  { category = 'Obese';         suggest = 'Weight Loss';  color = 'text-red-400'; }
    setResult({ bmi, category, suggest, color });
  };
  const inp = "w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none";
  return (
    <section className="py-20 bg-dark">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-card border border-gray-700 rounded-3xl p-8">
          <h2 className="font-heading font-black text-2xl text-white mb-2 text-center">🧮 BMI Calculator</h2>
          <p className="text-gray-400 text-sm text-center mb-6">Check your BMI and get a plan recommendation</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="text-gray-400 text-xs mb-1 block">Height (cm)</label>
              <input type="number" placeholder="e.g. 170" value={form.height} onChange={e => setForm({...form,height:e.target.value})} className={inp}/></div>
            <div><label className="text-gray-400 text-xs mb-1 block">Weight (kg)</label>
              <input type="number" placeholder="e.g. 70" value={form.weight} onChange={e => setForm({...form,weight:e.target.value})} className={inp}/></div>
          </div>
          <button onClick={calculate} className="w-full bg-primary hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">Calculate BMI</button>
          {result && (
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="mt-5 bg-dark rounded-2xl p-5 text-center border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Your BMI</p>
              <p className={`font-heading font-black text-5xl mb-1 ${result.color}`}>{result.bmi}</p>
              <p className={`font-semibold text-lg mb-3 ${result.color}`}>{result.category}</p>
              <div className="bg-secondary rounded-xl px-4 py-2 inline-block">
                <p className="text-sm text-gray-300">💡 Recommended: <span className="text-primary font-semibold">{result.suggest} Plan</span></p>
              </div>
              <div className="mt-4 relative h-3 rounded-full overflow-hidden bg-gray-800">
                <div className="absolute inset-0 flex"><div className="flex-1 bg-blue-500"/><div className="flex-1 bg-green-500"/><div className="flex-1 bg-yellow-400"/><div className="flex-1 bg-red-500"/></div>
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-dark shadow-lg" style={{left:`${Math.min(Math.max(((result.bmi-10)/30)*100,0),96)}%`}}/>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span></div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function JoinForm() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', age:'', weight:'', gender:'', goal:'', fitnessLevel:'', selectedPlan:'', message:'' });
  const [loading, setLoading] = useState(false);
  const inp = "w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition-colors";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name||!form.email||!form.phone||!form.age||!form.weight||!form.gender||!form.goal||!form.fitnessLevel||!form.selectedPlan)
      return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('🎉 Request sent! Login with your email & phone number as password. Wait for owner approval.');
      setForm({ name:'', email:'', phone:'', age:'', weight:'', gender:'', goal:'', fitnessLevel:'', selectedPlan:'', message:'' });
    } catch(err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
    setLoading(false);
  };

  return (
    <section id="join" className="py-20 bg-secondary">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white text-center mb-2">Join <span className="text-primary">Iron Will</span> Gym</h2>
          <p className="text-gray-400 text-center mb-8 text-sm">Fill the form — your request will be reviewed by the owner</p>
          <form onSubmit={handleSubmit} className="bg-card border border-gray-700 rounded-3xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">Full Name *</label>
              <input className={inp} placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Email *</label>
              <input type="email" className={inp} placeholder="you@email.com" value={form.email}  onChange={e=>setForm({...form,email:e.target.value})}/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Phone Number *</label>
              <input type="tel" className={inp} placeholder="10-digit number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Age *</label>
              <input type="number" className={inp} placeholder="Your age" value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Weight (kg) *</label>
              <input type="number" className={inp} placeholder="Your weight in kg" value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})}/>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Gender *</label>
              <select className={inp} value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Fitness Goal *</label>
              <select className={inp} value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}>
                <option value="">Select goal</option>
                <option value="weight_gain">Weight Gain 💪</option>
                <option value="weight_loss">Weight Loss 🔥</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Fitness Level *</label>
              <select className={inp} value={form.fitnessLevel} onChange={e=>setForm({...form,fitnessLevel:e.target.value})}>
                <option value="">Select your level</option>
                <option value="beginner">🌱 Beginner (0–6 months)</option>
                <option value="average">⚡ Average (6 months – 2 years)</option>
                <option value="expert">🔥 Expert (2+ years)</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Select Plan *</label>
              <select className={inp} value={form.selectedPlan} onChange={e=>setForm({...form,selectedPlan:e.target.value})}>
                <option value="">Select plan</option>
                <option value="1_month">1 Month — ₹999</option>
                <option value="3_month">3 Months — ₹2499</option>
                <option value="6_month">6 Months — ₹4499</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">Message to Trainer (Optional)</label>
              <textarea rows={3} className={inp} placeholder="Any specific goals, injuries or notes…" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>
            </div>
            <div className="sm:col-span-2 bg-dark/60 border border-gray-700 rounded-xl p-3 text-xs text-gray-400">
              💳 <strong className="text-white">Payment is done physically at the gym counter.</strong> Your login password will be your phone number.
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-orange-600 disabled:opacity-60 text-white font-heading font-bold py-4 rounded-xl text-base transition-colors">
                {loading ? 'Sending Request…' : 'Send Join Request 🚀'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const [feedbacks, setFeedbacks] = useState([]);
  useEffect(() => { api.get('/feedback').then(r=>setFeedbacks(r.data)).catch(()=>{}); }, []);

  const plans = [
    { duration:'1 Month',  price:'₹999',   features:['Full Gym Access','Basic Diet Plan','Workout Guidance','Locker Access'] },
    { duration:'3 Months', price:'₹2,499', features:['Full Gym Access','Custom Diet Plan','Workout Plan','Progress Tracking','10% Savings 🎉'] },
    { duration:'6 Months', price:'₹4,499', features:['Full Gym Access','Custom Diet Plan','Workout Plan','Progress Tracking','Priority Support','25% Savings 🔥'] },
  ];
  const placeholderFeedbacks = [
    { name:'Rahul S.',  rating:5, comment:'Best gym in Jaipur! Trainers are very professional.', createdAt:new Date() },
    { name:'Priya K.',  rating:5, comment:'Lost 12 kg in 3 months! The diet plan actually works.', createdAt:new Date() },
    { name:'Arjun M.',  rating:4, comment:'Great atmosphere. Gained 5 kg of muscle in 4 months!', createdAt:new Date() },
  ];

  return (
    <div className="min-h-screen bg-dark">
      <Navbar/>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-secondary to-dark"/>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, #FF6B35 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FFD700 0%, transparent 40%)'}}/>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{duration:0.6}}
            className="inline-block bg-primary/20 border border-primary/40 rounded-full px-4 py-1.5 text-primary text-sm font-semibold mb-6">
            💪 Jaipur's Premier Fitness Destination
          </motion.div>
          <motion.h1 initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.7}}
            className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-4">
            IRON WILL<br/><span className="text-primary">GYM</span>
          </motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
            className="text-gray-300 text-lg sm:text-xl max-w-xl mx-auto mb-8">
            Transform Your Body. Transform Your Life.
          </motion.p>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6}} className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#join" className="bg-primary hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-heading font-bold text-base transition-colors glow">Join Now — Free Consultation</a>
            <a href="#plans" className="border border-primary/60 hover:border-primary text-white px-8 py-4 rounded-xl font-semibold text-base transition-colors">View Plans & Pricing</a>
          </motion.div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.9}} className="flex justify-center gap-8 sm:gap-12 mt-16 flex-wrap">
            {[['200+','Members'],['5+','Years'],['Expert','Trainers'],['6AM–10PM','Daily']].map(([val,label])=>(
              <div key={label} className="text-center"><p className="font-heading font-black text-2xl text-primary">{val}</p><p className="text-gray-400 text-xs mt-0.5">{label}</p></div>
            ))}
          </motion.div>
        </div>
        <motion.div animate={{y:[0,10,0]}} transition={{repeat:Infinity,duration:1.5}} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
        </motion.div>
      </section>

      {/* ABOUT */}
      <section className="py-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{opacity:0,x:-40}} whileInView={{opacity:1,x:0}} viewport={{once:true}}>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">About Us</span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mt-2 mb-4">Your Ultimate <span className="text-primary">Fitness</span> Destination</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">Located in the heart of Jaipur, Iron Will Gym is where champions are made. State-of-the-art equipment, expert certified trainers, and personalized attention for every member.</p>
            <div className="grid grid-cols-2 gap-4">
              {[['🏋️','Modern Equipment','Latest machines & free weights'],['👨‍💼','Expert Trainers','Certified fitness professionals'],['🥗','Diet Guidance','Personalized nutrition plans'],['🔥','Results Focused','Track your progress daily']].map(([icon,title,desc])=>(
                <div key={title} className="bg-card rounded-xl p-4 border border-gray-700"><span className="text-2xl">{icon}</span><p className="font-semibold text-white text-sm mt-1">{title}</p><p className="text-gray-500 text-xs mt-0.5">{desc}</p></div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{opacity:0,x:40}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
            className="rounded-2xl overflow-hidden border border-gray-700 aspect-video bg-card flex items-center justify-center">
            <div className="text-center text-gray-500"><p className="text-5xl mb-3">🎥</p><p className="text-sm">Gym Tour Video</p><p className="text-xs mt-1">Replace with your YouTube embed</p></div>
          </motion.div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="py-20 bg-dark">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Membership</span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mt-2">Choose Your <span className="text-primary">Plan</span></h2>
            <p className="text-gray-400 text-sm mt-3">No hidden charges. No contracts. Just pure commitment.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {plans.map((plan,i)=>(
              <motion.div key={plan.duration} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{delay:i*0.1}} viewport={{once:true}}>
                <PlanCard plan={plan} popular={i===1}/>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8 bg-card rounded-2xl border border-gray-700 p-4 max-w-lg mx-auto">
            <p className="text-gray-400 text-sm">💳 <strong className="text-white">Payment is done physically at the gym counter.</strong> Select a plan and submit your join request below.</p>
          </div>
        </div>
      </section>

      {/* BMI */}
      <BMICalculator/>

      {/* FEEDBACKS */}
      <section className="py-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mt-2">What Our <span className="text-primary">Members</span> Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(feedbacks.length>0?feedbacks:placeholderFeedbacks).map((f,i)=><FeedbackCard key={i} feedback={f}/>)}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section id="location" className="py-20 bg-dark">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Find Us</span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mt-2">Our <span className="text-primary">Location</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="rounded-2xl overflow-hidden border border-gray-700 h-72">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114250!2d75.7873!3d26.9124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db1c000000001%3A0x1!2sJaipur!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"
                width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy" title="Gym Location"/>
            </div>
            <div className="space-y-3">
              {[['📍','Address','123 Fitness Street, Vaishali Nagar, Jaipur, Rajasthan 302021'],['📞','Phone','+91 98765 43210'],['✉️','Email','ironwillgym@email.com'],['🕐','Mon–Sat','5:00 AM – 10:00 PM'],['🕐','Sunday','6:00 AM – 8:00 PM']].map(([icon,label,val])=>(
                <div key={label} className="flex gap-4 bg-card border border-gray-700 rounded-xl p-4">
                  <span className="text-2xl">{icon}</span>
                  <div><p className="text-gray-500 text-xs">{label}</p><p className="text-white text-sm font-medium">{val}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OWNER */}
      <section className="py-20 bg-secondary">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="bg-card border border-gray-700 rounded-3xl p-8 flex flex-col sm:flex-row gap-8 items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-orange-700 flex-shrink-0 flex items-center justify-center text-white font-heading font-black text-4xl">R</div>
            <div>
              <span className="text-primary text-xs font-semibold uppercase tracking-wider">Founder & Head Trainer</span>
              <h3 className="font-heading font-black text-2xl text-white mt-1 mb-2">Rajesh Sharma</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">With over 10+ years of experience in fitness and nutrition, Rajesh has transformed hundreds of lives. Certified by ACE and ISSA, he believes in science-backed training with personalized attention for every member.</p>
              <div className="flex flex-wrap gap-2">
                {['ACE Certified','ISSA Nutritionist','10+ Years Exp','500+ Clients'].map(t=>(
                  <span key={t} className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full border border-primary/30">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <JoinForm/>
      <Footer/>
    </div>
  );
}