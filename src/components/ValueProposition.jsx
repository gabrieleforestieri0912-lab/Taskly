import React from "react";
import Link from "next/link";
import { Layers, ListChecks, NotebookPen } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    icon: Layers,
    title: "Unico workspace",
    text: "Tutto in un solo posto: progetti, task e note connessi tra loro.",
  },
  {
    icon: ListChecks,
    title: "Flusso operativo chiaro",
    text: "Riduci il tempo perso tra strumenti diversi e mantieni il focus sul lavoro vero.",
  },
  {
    icon: NotebookPen,
    title: "Pensato per execution",
    text: "Dalle idee ai task in pochi click, senza setup complessi.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ValueProposition() {
  return (
    <section className="px-6 py-20 bg-white dark:bg-[#151020]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="landing-eyebrow">
            Per chi lavora e studia ogni giorno
          </div>
          <h2 className="landing-heading-lg mt-3">
            Gestisci progetti, note e task in un unico spazio{" "}
            <span className="landing-display-accent">senza cambiare app</span>
          </h2>
          <p className="landing-body mt-3">
            Quando tutto &egrave; nello stesso workspace, smetti di rincorrere strumenti e torni a chiudere attivit&agrave;.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid md:grid-cols-3 gap-5"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={cardVariants}
                className="landing-card"
              >
                <div className="landing-icon-wrap">
                  <Icon size={20} />
                </div>
                <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.text}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 text-center">
          <Link href="/register" className="landing-btn-primary">
            Inizia gratis adesso
          </Link>
        </div>
      </div>
    </section>
  );
}
