import { useProducts } from '../../context/ProductContext';
import { box, PageHeader } from './AdminUI';

export default function MessagesPage() {
  const {
    messages,
    updateMessageStatus,
  } = useProducts();

  return (
    <>
      <PageHeader
        title="Contact Messages"
        subtitle="Messages submitted from the public Contact page."
      />

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`${box} p-5`}>
            <div className="flex flex-col md:flex-row justify-between gap-3">
              <div>
                <p className="text-xs text-black/40">
                  {message.name} · {message.email}
                </p>

                <h2 className="font-black text-lg mt-1">
                  {message.subject}
                </h2>
              </div>

              <select
                className="bg-neutral-100 rounded-lg px-3 py-2 text-sm"
                value={message.status}
                onChange={(event) =>
                  updateMessageStatus(
                    message.id,
                    event.target.value,
                  )
                }
              >
                <option>New</option>
                <option>Read</option>
                <option>Resolved</option>
              </select>
            </div>

            <p className="text-sm text-black/65 mt-4 whitespace-pre-wrap">
              {message.message}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
