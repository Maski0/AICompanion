'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LAppGlManager } from "@/components/2dComponents/lappglmanager";
import { useEffect } from "react";

type ExperienceType = '3D' | '2D'

interface ExperienceMenuProps {
  onSelect: (type: ExperienceType) => void
}

export function ExperienceMenu({ onSelect }: ExperienceMenuProps) {
  const [selected, setSelected] = useState<ExperienceType | null>(null)
  const router = useRouter()
  const handleSelect = (type: ExperienceType) => {
    setSelected(type)
    router.push(type === '3D' ? '/3d' : '/2d')
  }

  useEffect(() => {
    LAppGlManager.releaseInstance()
  })


  return (
    <div className="flex items-center justify-center h-full w-full bg-[#171720]">
      <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-[#1f1f28] rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-primary">Choose Your Experience</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => handleSelect('3D')}
            className="bg-slate-100/20 p-2 px-6 rounded-full text-white"
          >
            3D Experience
          </button>
          <button
            onClick={() => handleSelect('2D')}
            className="bg-slate-100/20 p-2 px-6 rounded-full text-white"
          >
            2D Experience
          </button>
        </div>
      </div>
    </div>
  )
}