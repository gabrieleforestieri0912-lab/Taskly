export default function WorkspaceLayout({ children, params }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="border-b border-gray-200 px-4 py-4 dark:border-gray-800">
        <h2>Workspace {params.id}</h2>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
