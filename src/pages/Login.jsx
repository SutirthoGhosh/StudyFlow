const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const handleGoogle = () => {
    db.auth.loginWithProvider("google", "/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">StudyFlow</h1>
          <p className="text-muted-foreground text-sm mt-2">Your smart homework tracker</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
          <h2 className="text-xl font-display font-semibold text-center mb-2">Welcome</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Sign in to manage your assignments, deadlines, and study sessions.
          </p>

          <Button
            className="w-full h-12 text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
            onClick={handleGoogle}
          >
            <GoogleIcon className="w-5 h-5 mr-3" />
            Continue with Google
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );