export const scrollToFAQ = () => {
  const faqSection = document.getElementById("duvidas-frequentes");
  if (faqSection) {
    // Scroll suave com offset para compensar o header fixo
    const headerOffset = 100; // ajuste conforme necessário
    const elementPosition = faqSection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};
