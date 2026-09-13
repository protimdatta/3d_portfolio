"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { config } from "@/data/config";
import { ABOUT } from "@/data/constants";
import { SectionHeader } from "./section-header";
import SectionWrapper from "../ui/section-wrapper";
import { cn } from "@/lib/utils";
import { BlurIn, BoxReveal } from "../reveal-animations";

const AboutSection = () => {
  return (
    <SectionWrapper id="about" className="min-h-screen w-full px-4 md:px-8 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          id="about"
          title="About Me"
          desc="Get to know me better"
          className="mb-16"
        />

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start md:items-center">
          {/* Profile Image */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative aspect-[4/5] max-w-xs mx-auto md:mx-0 rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-br from-background to-muted/30"
            >
              <Image
                src={config.profileImage}
                alt={`${config.firstName} ${config.lastName} - Full Stack Developer`}
                fill
                className="object-cover scale-105 transition-transform duration-700 hover:scale-110"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
            </motion.div>

            {/* Floating accent elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute -bottom-6 -left-6 w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -top-6 -right-6 w-32 h-32 rounded-2xl bg-primary/5 border border-primary/10 blur-xl"
            />
          </div>

          {/* About Content */}
          <div className="flex max-w-xl flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <div className="mb-8">
                <BlurIn delay={0.3} className="inline-block">
                  <span className="text-sm md:text-base font-medium text-primary uppercase tracking-widest">
                    {ABOUT.headline}
                  </span>
                </BlurIn>
              </div>

              <div className="space-y-6 text-lg md:text-xl leading-relaxed text-muted-foreground">
                {ABOUT.paragraphs.map((paragraph, index) => (
                  <BlurIn key={index} delay={0.5 + index * 0.15} className="mb-6 last:mb-0">
                    <p className="font-sans">{paragraph}</p>
                  </BlurIn>
                ))}
              </div>

              {/* Tech highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
                className="mt-10 flex flex-wrap gap-2"
              >
                {[
                  "React.js",
                  "Node.js",
                  "Express.js",
                  "MongoDB",
                  "Tailwind CSS",
                  "TypeScript",
                  "PHP",
                  "MySQL",
                  "Git",
                ].map((tech) => (
                  <BoxReveal key={tech} delay={1.1} width="fit-content">
                    <span className="mr-2 px-4 py-2 text-sm font-medium bg-secondary/50 border border-border/50 rounded-full text-foreground/80 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-300 cursor-default">
                      {tech}
                    </span>
                  </BoxReveal>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default AboutSection;