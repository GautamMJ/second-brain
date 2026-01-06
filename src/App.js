import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuth } from './useAuth';
import { analyzeThoughts } from './geminiService';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [thoughtText, setThoughtText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);

  // Load user's thought history
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'thoughts'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const thoughts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(thoughts);
    });

    return unsubscribe;
  }, [user]);

  const handleAnalyze = async () => {
    if (!thoughtText.trim()) {
      alert('Please enter your thoughts first');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeThoughts(thoughtText);
      setAnalysis(result);

      // Save to Firestore
      await addDoc(collection(db, 'thoughts'), {
        userId: user.uid,
        thoughtText: thoughtText,
        analysis: result,
        timestamp: new Date()
      });

      setThoughtText('');
    } catch (error) {
      alert('Error analyzing thoughts: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🧠 Second Brain</h1>
          <p className="tagline">Clear your mind, find your clarity</p>
          <p className="description">
            Stop overthinking. Dump your thoughts, and let AI help you sort 
            what matters from what doesn't.
          </p>
          <button onClick={signInWithGoogle} className="google-btn">
            Sign in with Google
          </button>
          <p className="disclaimer">
            ⚠️ This is thinking assistance, not therapy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>🧠 Second Brain</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={signOut} className="sign-out-btn">Sign Out</button>
        </div>
      </header>

      <main>
        <div className="input-section">
          <h2>Dump Your Thoughts</h2>
          <textarea
            value={thoughtText}
            onChange={(e) => setThoughtText(e.target.value)}
            placeholder="Write everything that's on your mind... worries, decisions, random thoughts. Just let it all out."
            rows="8"
          />
          <button 
            onClick={handleAnalyze} 
            disabled={analyzing}
            className="analyze-btn"
          >
            {analyzing ? 'Analyzing...' : 'Analyze My Thoughts'}
          </button>
        </div>

        {analysis && (
          <div className="analysis-section">
            <h2>Analysis Results</h2>
            
            <div className="card">
              <h3>📊 Thought Categories</h3>
              {analysis.categories?.map((cat, idx) => (
                <div key={idx} className={`category-item ${cat.type.toLowerCase()}`}>
                  <strong>{cat.type}:</strong> {cat.text}
                  <p className="explanation">{cat.explanation}</p>
                </div>
              ))}
            </div>

            {analysis.irrationalPatterns?.length > 0 && (
              <div className="card">
                <h3>⚠️ Irrational Thinking Patterns</h3>
                {analysis.irrationalPatterns.map((pattern, idx) => (
                  <div key={idx} className="pattern-item">
                    <strong>{pattern.pattern}:</strong> "{pattern.example}"
                    <p className="explanation">{pattern.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="card">
              <h3>💡 Logical Output</h3>
              
              <div className="output-section">
                <h4>✅ What Matters</h4>
                <ul>
                  {analysis.logicalOutput?.whatMatters?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="output-section">
                <h4>❌ What Doesn't Matter</h4>
                <ul>
                  {analysis.logicalOutput?.whatDoesntMatter?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="output-section">
                <h4>🎯 Next Rational Steps</h4>
                <ol>
                  {analysis.logicalOutput?.nextSteps?.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="history-section">
            <h2>Past Analyses ({history.length})</h2>
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="history-item">
                <p className="thought-preview">
                  {item.thoughtText.substring(0, 100)}...
                </p>
                <small>{new Date(item.timestamp.toDate()).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer>
        <p className="disclaimer">
          ⚠️ This is a thinking assistance tool, not a replacement for professional therapy.
          If you're experiencing severe distress, please contact a mental health professional.
        </p>
      </footer>
    </div>
  );
}

export default App;
