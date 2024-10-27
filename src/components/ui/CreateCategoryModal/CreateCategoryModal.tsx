import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCategory: (categoryName: string) => Promise<void>;
}

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onCreateCategory,
}: CreateCategoryModalProps) {
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleSubmit = async () => {
    await onCreateCategory(newCategoryName);
    setNewCategoryName(""); // Reset input after submission
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-[400px] focus:outline-none">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Create New Category
          </Dialog.Title>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
