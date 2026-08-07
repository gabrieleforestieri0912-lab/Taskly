import SupportForm from "./SupportForm";

export const metadata = {
  title: "Supporto - Taskly",
  description: "Supporto e invio feedback per Taskly.",
};

export default function SupportPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Supporto</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Se hai bisogno di aiuto o vuoi inviare feedback, scrivici qui sotto.
      </p>
      <SupportForm />
    </main>
  );
}
