export default function CreateRequestModal({ onClose, onCreate }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="bg-white p-6 rounded w-96">
          <h3 className="text-lg font-bold mb-4">New Maintenance Request</h3>
  
          <input
            className="border p-2 w-full mb-3"
            placeholder="Subject"
            onChange={e => onCreate({ subject: e.target.value })}
          />
  
          <select
            className="border p-2 w-full mb-3"
            onChange={e => onCreate({ type: e.target.value })}
          >
            <option value="CORRECTIVE">Corrective</option>
            <option value="PREVENTIVE">Preventive</option>
          </select>
  
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1">
              Cancel
            </button>
            <button className="bg-blue-600 text-white px-3 py-1 rounded">
              Create
            </button>
          </div>
        </div>
      </div>
    );
  }
  