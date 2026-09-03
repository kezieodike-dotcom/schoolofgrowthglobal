"use client";
import React from "react";

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
  return (
    <div className={props.className}>
      <div className="flex flex-col gap-6 pb-6 bg-background">
        {props.testimonials.map(({ text, image, name, role }, i) => (
          <div className="p-10 rounded-3xl border bg-white shadow-lg shadow-primary/10 max-w-xs w-full" key={i}>
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
          </div>
        ))}
      </div>
    </div>
  );
};
