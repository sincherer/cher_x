import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ProfessionalAI() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    profile: null,
    workExperience: [],
    education: [],
    skills: [],
    projects: []
  });

  useEffect(() => {
    fetchAllProfileData();
  }, []);

  async function fetchAllProfileData() {
    try {
      const [profileRes, workRes, eduRes, skillsRes, projectsRes] = await Promise.all([
        supabase.from('profile').select('*').single(),
        supabase.from('work_experience').select('*').order('start_date', { ascending: false }),
        supabase.from('education').select('*').order('start_date', { ascending: false }),
        supabase.from('skills').select('*'),
        supabase.from('projects').select('*')
      ]);

      setProfileData({
        profile: profileRes.data,
        workExperience: workRes.data || [],
        education: eduRes.data || [],
        skills: skillsRes.data || [],
        projects: projectsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  }

  async function generateResponse() {
    setLoading(true);
    try {
      // Prepare the context from your professional data
      const context = {
        profile: profileData.profile,
        workExperience: profileData.workExperience,
        education: profileData.education,
        skills: profileData.skills,
        projects: profileData.projects
      };

      // Call your AI service with the context and query
      const response = await fetch('https://api-inference.huggingface.co/models/your-chosen-model', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_HUGGING_FACE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `
            Context: ${JSON.stringify(context)}
            
            Question: ${query}
            
            Please provide a professional response based only on the information in the context.
          `
        })
      });

      const result = await response.json();
      setResponse(result[0].generated_text || 'I apologize, but I can only provide information based on your professional profile data.');
    } catch (error) {
      console.error('Error generating AI response:', error);
      setResponse('I apologize, but I encountered an error while generating a response. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="professional-ai">
      <h2>Professional AI Assistant</h2>
      <p>Ask questions about my professional background, and the AI will respond based on my actual data.</p>
      
      <div className="query-input">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about my professional background..."
          rows={3}
        />
        <button 
          onClick={generateResponse} 
          disabled={loading || !query.trim()}
        >
          {loading ? 'Generating...' : 'Get Response'}
        </button>
      </div>
      
      {response && (
        <div className="ai-response">
          <h3>Response:</h3>
          <div className="response-content">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}