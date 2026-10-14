import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, Copy, Check, AlertCircle, KeyRound, Lock, AlertTriangle } from 'lucide-react';
import './App.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [nmsNumber, setNmsNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMessage(null);

    const nmsInput = nmsNumber.trim();
    const nameInput = fullName.trim();

    try {
      const { data, error } = await supabase.functions.invoke('register', {
        body: { nms_number: nmsInput, full_name: nameInput },
      });

      let resData = data;
      if (error && error.context) {
        try {
          const parsed = await error.context.json();
          if (parsed && typeof parsed === 'object') {
            resData = parsed;
          }
        } catch {
          // fallback
        }
      }

      if (resData?.ok && resData?.code) {
        setCode(resData.code);
        setErrorMessage(null);
      } else {
        const msg = resData?.message || (typeof error?.message === 'string' ? error.message : null) || 'Registration failed. Check your details or contact the electoral committee.';
        setErrorMessage(msg);
      }
    } catch {
      setErrorMessage('Network connection error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <span className="badge">Voter Accreditation Portal</span>
          <h1>NMS 08 Digital Governance</h1>
          <p className="subtitle">
            Official registration for accredited members of the NMS 2008 Set. Verify your roster credentials to receive your one-time voting key.
          </p>
        </div>

        {code ? (
          <div className="success-view">
            <div className="success-icon-wrapper">
              <KeyRound size={28} />
            </div>
            <h2>Accreditation Successful</h2>
            <p className="success-sub">Your one-time login credentials have been generated.</p>

            <div className="alert alert-warning">
              <AlertTriangle size={20} className="alert-icon" />
              <div>
                <strong>Write this down now.</strong>
                <p>This code will NOT be shown again. If you lose this code, you must contact the electoral committee for an administrative reset before voting.</p>
              </div>
            </div>

            <div className="code-box">
              <span className="code-label">Your One-Time Code</span>
              <div id="registration-code-display" className="code-text">{code}</div>
              <span className="code-desc">6-character cryptographic voter token</span>
            </div>

            <button
              type="button"
              id="copy-code-btn"
              onClick={copyToClipboard}
              className="btn btn-primary"
            >
              {copied ? (
                <>
                  <Check size={18} /> Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy size={18} /> Copy Code
                </>
              )}
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="form">
            {errorMessage && (
              <div id="registration-error-alert" className="alert alert-danger">
                <AlertCircle size={18} className="alert-icon" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="nms_number">
                <ShieldCheck size={16} /> NMS Service Number
              </label>
              <input
                id="nms_number"
                type="text"
                required
                placeholder="e.g. NMS/08/6672"
                value={nmsNumber}
                onChange={(e) => setNmsNumber(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
              <span className="field-hint">Format: NMS/08/XXXX (variants like spaces or dashes are accepted)</span>
            </div>

            <div className="form-group">
              <label htmlFor="full_name">
                <Lock size={16} /> Full Name (as on roster)
              </label>
              <input
                id="full_name"
                type="text"
                required
                placeholder="e.g. Isah NUPEKO Mohammed"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />
              <span className="field-hint">Enter at least two parts of your name matching your roster entry.</span>
            </div>

            <button
              type="submit"
              id="get-code-submit-btn"
              disabled={loading || !nmsNumber.trim() || !fullName.trim()}
              className="btn btn-primary"
            >
              {loading ? 'Verifying details...' : 'Get my code'}
            </button>
          </form>
        )}

        <div className="footer">
          <p>NMS Class of 2008 Electoral Commission</p>
        </div>
      </div>
    </div>
  );
}
