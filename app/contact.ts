export const lordsCareWhatsAppNumber = process.env.NEXT_PUBLIC_LORDSCARE_WHATSAPP || "916238196131";

export function createWhatsAppUrl(message: string) {
  return `https://wa.me/${lordsCareWhatsAppNumber}?text=${encodeURIComponent(message)}`;
}

export const generalWhatsAppUrl = createWhatsAppUrl(
  "Hello LordsCare, I would like to know more about your Lords Bot subscription plans."
);
