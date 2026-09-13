"use client";

import { motion } from "motion/react";
import { EDUCATION, CERTIFICATIONS, ACHIEVEMENTS } from "@/data/constants";
import { SectionHeader } from "./section-header";
import SectionWrapper from "../ui/section-wrapper";
import { cn } from "@/lib/utils";
import { BlurIn, BoxReveal } from "../reveal-animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { Award, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";

const EducationSection = () => {
  return (
    <SectionWrapper id="education" className="min-h-screen w-full px-4 md:px-8 py-20 md:py-28">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          id="education"
          title="Education & Certifications"
          desc="My academic journey and credentials"
          className="mb-16"
        />

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-16">
            <BlurIn delay={0.2} className="inline-flex items-center gap-2 mb-6">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="text-2xl font-bold tracking-tight">Education</h3>
            </BlurIn>

            <div className="space-y-6">
              {EDUCATION.map((edu, index) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                >
                  <Card className={cn(
                    "bg-card text-card-foreground border-border",
                    "hover:border-primary/20 transition-colors duration-300",
                    "shadow-sm hover:shadow-md",
                    "relative overflow-hidden"
                  )}>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/20" />
                    <CardHeader className="pb-3 relative z-10">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            {edu.program}
                          </CardTitle>
                          <div className="text-base font-medium text-muted-foreground flex items-center gap-2">
                            <span>{edu.focus}</span>
                          </div>
                          <div className="text-sm text-muted-foreground/80 flex items-center gap-2">
                            <span>{edu.institution}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="w-fit font-mono text-xs font-normal flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          {edu.period}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      <ul className="list-disc list-outside ml-4 space-y-2 text-base text-muted-foreground leading-relaxed">
                        {edu.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <div className="mb-16">
            <BlurIn delay={0.2} className="inline-flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="text-2xl font-bold tracking-tight">Certifications</h3>
            </BlurIn>

            <div className="space-y-4">
              {CERTIFICATIONS.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1, ease: "easeOut" }}
                >
                  <Card className={cn(
                    "bg-card text-card-foreground border-border",
                    "hover:border-primary/20 transition-colors duration-300",
                    "shadow-sm hover:shadow-md"
                  )}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-bold tracking-tight">{cert.title}</CardTitle>
                          <div className="text-sm text-muted-foreground">{cert.issuer}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="gap-1.5 bg-green-500/10 border-green-500/30 text-green-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {cert.status}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {cert.year}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <div>
            <BlurIn delay={0.2} className="inline-flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="text-2xl font-bold tracking-tight">Key Achievements</h3>
            </BlurIn>

            <div className="grid sm:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05, ease: "easeOut" }}
                >
                  <Card className={cn(
                    "bg-card text-card-foreground border-border",
                    "hover:border-primary/20 transition-colors duration-300",
                    "shadow-sm hover:shadow-md",
                    "h-full"
                  )}>
                    <CardContent className="pt-6 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed">{achievement}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

export default EducationSection;