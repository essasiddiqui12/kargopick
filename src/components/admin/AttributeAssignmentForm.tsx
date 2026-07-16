"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, CheckCircle2, XCircle } from "lucide-react";
import type { ProductAttribute } from "@/types";

interface AttributeAssignment {
  id: string;
  product_id: string;
  attribute_id: string;
  is_required: boolean;
  is_variant: boolean;
  sort_order: number;
}

interface AttributeAssignmentFormProps {
  productId: string;
  assignments: AttributeAssignment[];
  onChange: (assignments: AttributeAssignment[]) => void;
}

export default function AttributeAssignmentForm({ productId, assignments, onChange }: AttributeAssignmentFormProps) {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchAttributes() {
      try {
        const res = await fetch("/api/admin/attributes");
        if (res.ok) {
          const data = await res.json();
          setAttributes(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchAttributes();
  }, []);

  const assignedIds = new Set(assignments.map((a) => a.attribute_id));

  function toggleAssignment(attrId: string) {
    if (assignedIds.has(attrId)) {
      onChange(assignments.filter((a) => a.attribute_id !== attrId));
    } else {
      const newAssignment: AttributeAssignment = {
        id: `assign-${productId}-${attrId}-${Date.now()}`,
        product_id: productId,
        attribute_id: attrId,
        is_required: false,
        is_variant: true,
        sort_order: assignments.length,
      };
      onChange([...assignments, newAssignment]);
    }
  }

  function updateAssignment(attrId: string, updates: Partial<AttributeAssignment>) {
    onChange(
      assignments.map((a) =>
        a.attribute_id === attrId ? { ...a, ...updates } : a
      )
    );
  }

  async function saveAssignments() {
    setSaving(true);
    try {
      await Promise.all(
        assignments.map((a) =>
          fetch("/api/admin/attribute-assignments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(a),
          })
        )
      );
      alert("Attributes saved successfully!");
    } catch {
      alert("Failed to save attributes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-500">
          Select attributes to assign to this product. Attributes marked as &quot;Creates Variants&quot; will generate variant combinations.
        </p>
      </div>

      {attributes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-6 text-center">
          <p className="text-sm text-surface-500">
            No attributes defined yet. Go to <strong>Admin → Attributes</strong> to create global attributes first.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {attributes.map((attr) => {
            const assignment = assignments.find((a) => a.attribute_id === attr.id);
            const isAssigned = !!assignment;

            return (
              <div
                key={attr.id}
                className={`rounded-xl border p-4 ${
                  isAssigned ? "border-brand-200 bg-brand-50/30" : "border-surface-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleAssignment(attr.id)}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                        isAssigned
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-surface-300 bg-white hover:border-brand-400"
                      }`}
                    >
                      {isAssigned && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <div>
                      <h4 className="font-medium text-surface-900">{attr.display_name}</h4>
                      <p className="text-xs text-surface-500">{attr.type} · {attr.name}</p>
                    </div>
                  </div>

                  {isAssigned && (
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={assignment.is_variant}
                          onChange={(e) => updateAssignment(attr.id, { is_variant: e.target.checked })}
                          className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-surface-700">Creates Variants</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={assignment.is_required}
                          onChange={(e) => updateAssignment(attr.id, { is_required: e.target.checked })}
                          className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-surface-700">Required</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {assignments.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveAssignments}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Attributes
          </button>
        </div>
      )}
    </div>
  );
}
