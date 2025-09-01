import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    id: "item-1",
    question: "How do I start playing games?",
    answer: "Just login/sign up, add some funds to your wallet then click on any game from the Featured Games section. No install needed — everything runs in your browser."
  },
  {
    id: "item-2", 
    question: "Is this real money betting?",
    answer: "Yes. You can enter games with real money, and win based on performance. All games are skill-based."
  },
  {
    id: "item-3",
    question: "What happens if I disconnect mid-game?", 
    answer: "If you disconnect, your session may auto-forfeit depending on the game. Make sure you have a stable connection before playing."
  },
  {
    id: "item-4",
    question: "Can I play without spending money?",
    answer: "No. All games on the platform require a real-money entry to join. This keeps the competition meaningful and ensures every match has real stakes."
  },
  {
    id: "item-5",
    question: "Are these games fair?",
    answer: "Absolutely. All outcomes are determined by skill and server-side logic — no RNG advantage, no rigging."
  }
];

export const FAQ = () => {
  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Still have Questions?
        </h2>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqData.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className="border border-border rounded-lg px-6 py-2 bg-card hover:bg-card/80 transition-colors"
            >
              <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};