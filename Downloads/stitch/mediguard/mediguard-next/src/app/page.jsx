"use client"
import React from 'react'
import Link from 'next/link'

const html = `
<div class="bg-background text-on-background font-body-md antialiased md:hidden overflow-x-hidden">
<!-- TopAppBar -->
<header class="bg-surface dark:bg-inverse-surface w-full top-0 sticky border-b border-outline-variant dark:border-outline z-50">
<div class="flex items-center justify-between px-margin-mobile py-base w-full max-w-container-max mx-auto">
<button class="text-primary dark:text-primary-fixed hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors p-2 rounded-full active:opacity-80 transition-all flex items-center justify-center">
<span class="material-symbols-outlined">menu</span>
</button>
<div class="font-display-lg text-headline-md-mobile font-bold text-primary dark:text-primary-fixed">
                MediGuard AI
            </div>
<button class="text-primary dark:text-primary-fixed hover:bg-surface-container dark:hover:bg-surface-container-high transition-colors p-2 rounded-full active:opacity-80 transition-all flex items-center justify-center">
<span class="material-symbols-outlined">notifications</span>
</button>
</div>
</header>
<main class="w-full max-w-container-max mx-auto">
<!-- Hero Section -->
<section class="relative pt-12 pb-16 px-margin-mobile bg-grid-pattern overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-b from-surface/80 to-background z-0"></div>
<div class="relative z-10 flex flex-col items-center text-center">
<div class="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-primary/20 bg-primary/5 text-primary text-label-md font-label-md">
<span class="material-symbols-outlined text-[16px] fill">verified</span>
                    Clinical Grade AI V2.4 Active
                </div>
<h1 class="font-display-lg text-display-lg mb-4 tracking-tight text-on-surface">
                    Precision Drug Analysis. <br/>
<span class="text-primary">Instant Decision Support.</span>
</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-md">
                    Empower your practice with RAG-based AI that cross-references global pharmacopeia to detect complex drug interactions instantly.
                </p>
<div class="flex flex-col w-full gap-4 sm:flex-row sm:justify-center">
<button class="w-full sm:w-auto px-6 py-4 bg-primary text-on-primary font-label-md text-label-md rounded-xl flex items-center justify-center gap-2 hover:bg-primary-fixed-variant transition-colors active:opacity-80" onclick="window.location.href='/login'">
<span class="material-symbols-outlined">troubleshoot</span>
                        Check Drug Interaction
                    </button>
<button class="w-full sm:w-auto px-6 py-4 bg-surface border border-outline text-on-surface font-label-md text-label-md rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors active:opacity-80" onclick="window.location.href='/login'">
<span class="material-symbols-outlined">play_circle</span>
                        Clinician Login
                    </button>
</div>
</div>
<!-- Hero Image/Graphic Placeholder -->
<div class="relative mt-12 z-10 w-full max-w-lg mx-auto rounded-xl border border-outline-variant bg-surface overflow-hidden shadow-[0_4px_24px_-4px_rgba(0,30,80,0.1)]">
<div class="bg-surface-container-low border-b border-outline-variant px-4 py-2 flex items-center gap-2">
<div class="w-2.5 h-2.5 rounded-full bg-error"></div>
<div class="w-2.5 h-2.5 rounded-full bg-[#E5B500]"></div>
<div class="w-2.5 h-2.5 rounded-full bg-[#00B8D9]"></div>
<span class="ml-2 font-data-mono text-[10px] text-on-surface-variant uppercase">Interaction Matrix Analysis</span>
</div>
<div class="p-4 bg-surface flex flex-col gap-3">
<div class="flex justify-between items-center pb-2 border-b border-outline-variant">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary">medication</span>
<span class="font-data-mono text-data-mono font-bold text-on-surface">Warfarin (5mg)</span>
</div>
<span class="material-symbols-outlined text-outline">close</span>
</div>
<div class="flex justify-between items-center pb-2 border-b border-outline-variant">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary">medication</span>
<span class="font-data-mono text-data-mono font-bold text-on-surface">Amiodarone (200mg)</span>
</div>
<span class="material-symbols-outlined text-outline">close</span>
</div>
<div class="mt-2 p-3 bg-error-container/20 border border-error-container rounded-lg flex items-start gap-3">
<span class="material-symbols-outlined text-error fill mt-0.5">warning</span>
<div>
<div class="font-label-md text-label-md text-error uppercase tracking-wider mb-1">Severe Interaction Detected</div>
<div class="font-body-sm text-body-sm text-on-surface">Increased risk of bleeding. Amiodarone significantly inhibits Warfarin metabolism.</div>
</div>
</div>
</div>
</div>
</section>
<!-- Features Bento Grid -->
<section class="py-16 px-margin-mobile bg-surface-container-low">
<div class="mb-10 text-center">
<h2 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-3">Architected for Medical Professionals</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Cognitive clarity meets rigorous data density.</p>
</div>
<div class="grid grid-cols-1 gap-4">
<!-- Feature 1: RAG -->
<div class="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col gap-4">
<div class="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center text-primary">
<span class="material-symbols-outlined fill text-[24px]">database</span>
</div>
<div>
<h3 class="font-headline-md text-[20px] font-semibold text-on-surface mb-2">RAG-Powered Intelligence</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Retrieval-Augmented Generation ensures every alert is backed by cited, up-to-date peer-reviewed medical literature. No hallucinations, just hard data.</p>
</div>
</div>
<!-- Feature 2: Speed -->
<div class="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col gap-4">
<div class="w-12 h-12 bg-secondary-container/20 rounded-full flex items-center justify-center text-secondary">
<span class="material-symbols-outlined fill text-[24px]">bolt</span>
</div>
<div>
<h3 class="font-headline-md text-[20px] font-semibold text-on-surface mb-2">Sub-Second Analysis</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Analyze patient med-lists of 20+ drugs against thousands of pathways in under 800ms. Perfect for high-volume emergency departments.</p>
</div>
</div>
</div>
</section>
<!-- Testimonials -->
<section class="py-16 px-margin-mobile bg-surface">
<h2 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-8 text-center">Trusted by Clinical Leaders</h2>
<div class="flex flex-col gap-4">
<div class="border border-outline-variant rounded-xl p-6 bg-surface-container-lowest">
<div class="flex text-primary mb-4">
<span class="material-symbols-outlined fill text-[18px]">star</span>
<span class="material-symbols-outlined fill text-[18px]">star</span>
<span class="material-symbols-outlined fill text-[18px]">star</span>
<span class="material-symbols-outlined fill text-[18px]">star</span>
<span class="material-symbols-outlined fill text-[18px]">star</span>
</div>
<p class="font-body-md text-body-md text-on-surface mb-6 italic">"The clinical minimalism approach is a breath of fresh air. It highlights critical alerts without the visual noise common in legacy EHR systems. It acts like a vigilant co-pilot during complex polypharmacy reviews."</p>
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary font-bold">
                            AJ
                        </div>
<div>
<div class="font-label-md text-label-md font-bold text-on-surface">Dr. Aris Johnson</div>
<div class="font-body-sm text-[12px] text-on-surface-variant">Chief Resident, Internal Medicine</div>
</div>
</div>
</div>
</div>
</section>
</main>
<!-- Footer -->
<footer class="bg-inverse-surface py-12 px-margin-mobile border-t border-outline/20">
<div class="max-w-container-max mx-auto flex flex-col items-center text-center">
<div class="font-display-lg text-[24px] font-bold text-on-primary mb-2">
                MediGuard AI
            </div>
<p class="font-body-sm text-body-sm text-inverse-on-surface/70 mb-8 max-w-xs">
                Clinical Decision Support Systems engineered for accuracy.
            </p>
<div class="flex gap-6 mb-8">
<a class="font-label-md text-label-md text-inverse-on-surface hover:text-primary-fixed transition-colors" href="#">Privacy Policy</a>
<a class="font-label-md text-label-md text-inverse-on-surface hover:text-primary-fixed transition-colors" href="#">Terms of Service</a>
<a class="font-label-md text-label-md text-inverse-on-surface hover:text-primary-fixed transition-colors" href="#">Contact Support</a>
</div>
<div class="font-body-sm text-[12px] text-inverse-on-surface/50">
                © 2024 MediGuard AI Solutions. All rights reserved. <br/> For professional medical use only.
            </div>
</div>
</footer>
</div>
`

export default function Landing(){
  return <div dangerouslySetInnerHTML={{__html: html}} />
}
