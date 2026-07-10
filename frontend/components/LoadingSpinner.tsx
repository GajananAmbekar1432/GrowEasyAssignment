"use client";
import React from 'react';

export default function LoadingSpinner(){
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
