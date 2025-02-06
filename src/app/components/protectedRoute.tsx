'use client'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const ProtectedRout = ({children}: {children : React.ReactNode}) => {
    const router = useRouter()


    useEffect(() => {
      if (typeof window !== "undefined") {
          const isLoggedIn = localStorage.getItem("isLoggedIn");
          if (!isLoggedIn) {
              router.push("/admin");
          }
      }
  }, [router]);

  return <>
      {children}
  </>
}

export default  ProtectedRout

