"use client"

import Image from "next/image"

const universities = [
  { abbr: "DU",  name: "Duke University",                   logo: "/universities/Duke.svg" },
  { abbr: "IU",  name: "Indiana University",                logo: "/universities/Indiana.svg" },
  { abbr: "MSU", name: "Michigan State University",         logo: "/universities/Michigan_State.svg" },
  { abbr: "UM",  name: "University of Michigan",             logo: "/universities/Michigan.svg" },
  { abbr: "UT",  name: "University of Tennessee",           logo: "/universities/Tennessee.svg" },
  { abbr: "MIA", name: "University of Miami",               logo: "/universities/Miami.svg" },
  { abbr: "UK",  name: "University of Kentucky",            logo: "/universities/Kentucky.svg" },
  { abbr: "KU",  name: "University of Kansas",              logo: "/universities/Kansas.svg" },
  { abbr: "CU",  name: "Clemson University",                logo: "/universities/Clemson.svg" },
  { abbr: "UGA", name: "University of Georgia",             logo: "/universities/Georgia.svg" },
  { abbr: "LSU", name: "Louisiana State University",        logo: "/universities/LSU_.svg" },
  { abbr: "USC", name: "University of Southern California", logo: "/universities/USC.svg" },
  { abbr: "ND",  name: "Notre Dame",                        logo: "/universities/Notre_Dame.svg" },
  { abbr: "UD",  name: "University of Dayton",              logo: "/universities/Dayton.svg" },
  { abbr: "XU",  name: "Xavier University",                 logo: "/universities/Xavier.svg" },
  { abbr: "SC",  name: "Springfield College",               logo: "/universities/Springfield.svg" },
]

export default function UniversityLogoBar() {
  const doubled = [...universities, ...universities]

  return (
    <section className="bg-[#08090a] py-12 px-4 sm:px-6">
      <p className="text-center text-sm font-medium uppercase tracking-wider text-white/30 mb-8">
        Athletes from top universities
      </p>

      <div className="relative overflow-hidden">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#08090a] to-transparent z-10 pointer-events-none" />

        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#08090a] to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex w-max animate-scroll gap-12 items-center">
          {doubled.map((uni, i) => (
            <div
              key={`${uni.abbr}-${i}`}
              className="flex-shrink-0 flex items-center justify-center h-12 px-6"
            >
              {uni.logo ? (
                <Image
                  src={uni.logo}
                  alt={uni.name}
                  width={80}
                  height={40}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <>
                  <span className="text-lg font-bold text-zinc-400 tracking-wide">{uni.abbr}</span>
                  <span className="ml-2 text-sm text-zinc-600 hidden sm:inline">{uni.name}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
