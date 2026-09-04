"use client";
import React from "react";
import { motion, useReducedMotion } from 'motion/react';

export interface TestimonialItem {
  text: string;
  image: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: TestimonialItem[];
  duration?: number;
}) => {
  const reduceMotion = useReducedMotion();
  const loopedTestimonials = [...props.testimonials, ...props.testimonials];

  return (
    <motion.div className={props.className}>
      <motion.div
        className="flex flex-col gap-6 pb-6 bg-background"
        animate={reduceMotion ? undefined : { translateY: "-50%" }}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: props.duration ?? 20,
                repeat: Infinity,
                ease: 'linear',
              }
        }
      >
        {loopedTestimonials.map(({ text, image, name, role }, i) => (
          <motion.article
            className="p-10 rounded-3xl border bg-white shadow-lg shadow-primary/10 max-w-xs w-full outline-none"
            key={`${name}-${i}`}
            tabIndex={0}
            whileHover={reduceMotion ? undefined : { y: -8, scale: 1.025 }}
            whileFocus={reduceMotion ? undefined : { y: -8, scale: 1.025 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          >
            <div>{text}</div>
            <div className="flex items-center gap-2 mt-5">
              <img
                width={40}
                height={40}
                src={image}
                alt={name}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex flex-col">
                <div className="font-medium tracking-tight leading-5">{name}</div>
                <div className="leading-5 opacity-60 tracking-tight">{role}</div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </motion.div>
  );
};
