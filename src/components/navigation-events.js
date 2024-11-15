'use client'

import { useEffect  } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LAppDelegate } from './2dComponents/lappdelegate'

export function NavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const router = useRouter()

  useEffect(() => {
    const url = `${pathname}?${searchParams.toString()}`
    console.log(url);
    if (pathname === '/') {
        //LAppDelegate.normalReleaseInstance();
        const canvas = document.getElementById("live2dCanvas");
        console.log(canvas);
        if (canvas) {
          // const gl = canvas.getContext("webgl2");
          // if (gl) {
          //   gl.getExtension('WEBGL_lose_context')?.loseContext(); // Lose the context
          //   console.log("WebGL context lost.");
          // }
          //canvas.parentNode.removeChild(canvas); // Remove canvas from DOM
        }
    }
    // You can now use the current URL
    // ...

  }, [pathname, searchParams])

  return null
}
