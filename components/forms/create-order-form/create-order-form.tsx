"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldDescription,
  FieldSet,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Table from "@/components/ui/table";
import { useServerTable, Column } from "@/lib/hooks/useServerTable";
import {
  fetchAssets,
  fetchOrderFormOptions,
  createOrder,
} from "@/lib/fetchers/orderform/orderform";
import "./create-order-form.css";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from "@/components/ui/combobox";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function CreateOrderForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ location: string | null }>({ location: null });
  const [formOptions, setFormOptions] = useState<{ locations: Array<{ location_name: string }> }>({ locations: [] });
  const [selected, setSelected] = useState<any[]>([]);

  const [leftSelected, setLeftSelected] = useState<number[]>([]);
  const [rightSelected, setRightSelected] = useState<number[]>([]);
  const [leftAllSelected, setLeftAllSelected] = useState(false);
  const [rightAllSelected, setRightAllSelected] = useState(false);

  // -------------------------
  // Fetch form options
  // -------------------------
  useEffect(() => {
    fetchOrderFormOptions().then((res) => {
      setFormOptions({ locations: res || [] });
    });
  }, []);

  useEffect(() => {
    setSelected([]);
    setLeftSelected([]);
    setRightSelected([]);
    setFilters({});
  }, [formData.location]);

  const locationOptions =
    formOptions?.locations?.map((l) => ({
      value: l.location_name,
      label: l.location_name,
    })) || [];

  // -------------------------
  // Server table endpoint
  // -------------------------
  const fetchAssetsTable = async ({ filters, sortKey, sortDirection }: any) => {
    if (!formData.location) return { data: [], total: 0, filterOptions: {} };

    const res = await fetchAssets({
      location: formData.location,
      filters,
      sortKey,
      sortDirection,
    });

    let filtered = [...res.data];

    // Remove already selected
    filtered = filtered.filter(
      (a) => !selected.some((s) => s.asset_id === a.asset_id)
    );

    if (sortKey) {
      filtered.sort((a: any, b: any) => {
        if (a[sortKey] < b[sortKey]) return sortDirection === "asc" ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return {
      data: filtered,
      total: filtered.length,
      filterOptions: res.filterOptions,
    };
  };

  // -------------------------
  // Table hook
  // -------------------------
  const {
    data: available,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
    clearAll,
    globalFilterOptions,
  } = useServerTable({
    endpoint: fetchAssetsTable,
    columns: [],
    limit: 1000,
    deps: [formData.location, selected],
    disablePagination: true,
  });

  // -------------------------
  // Sync "Select All" with selected items
  // -------------------------
  useEffect(() => {
    setLeftAllSelected(
      available.length > 0 && leftSelected.length === available.length
    );
  }, [leftSelected, available]);

  useEffect(() => {
    setRightAllSelected(
      selected.length > 0 && rightSelected.length === selected.length
    );
  }, [rightSelected, selected]);

  // -------------------------
  // Columns
  // -------------------------
  const availableColumns: Column[] = [
  {
    key: "select",
    label: "",
    width: "w-[20px]",
    renderHeader: () => (
      <div className="flex items-center justify-center border-2 border-black rounded ">
      <Checkbox
        checked={leftAllSelected}
        onCheckedChange={(checked) => {
          const val = !!checked;
          setLeftAllSelected(val);
          // Select all available rows if checked, else clear selection
          setLeftSelected(val ? available.map((a) => Number(a.asset_id)) : []);
        }}
      />
      </div>
    ),
    render: (row) => (
      <Checkbox className="flex items-center justify-center border-2 border-black rounded"
        checked={leftSelected.includes(Number(row.asset_id))}
        onCheckedChange={() => {
          setLeftSelected((prev) =>
            prev.includes(Number(row.asset_id))
              ? prev.filter((id) => id !== Number(row.asset_id))
              : [...prev, Number(row.asset_id)]
          );
        }}
      />
    ),
  },
  { key: "serial_number", label: "Serial Number", sortable: true, width: "w-[60px]" },
  { key: "asset_name", label: "Asset Name", sortable: true, filterable: true, width: "w-[80px]" },
  { key: "type_name", label: "Type", sortable: true, filterable: true, width: "w-[80px]" },
];
  const selectedColumns: Column[] = [
    {
      key: "select",
      label: "",
      width: "w-[15px]",
      renderHeader: () => (
        <div className="flex items-center justify-center border-2 border-black rounded">
          <Checkbox
            checked={rightAllSelected}
            onCheckedChange={(checked) => {
              const val = !!checked;
              setRightAllSelected(val);
              setRightSelected(val ? selected.map((a) => Number(a.asset_id)) : []);
            }}
          />
        </div>
      ),
      render: (row) => (
          <Checkbox className="flex items-center justify-center border-2 border-black rounded"
            checked={rightSelected.includes(Number(row.asset_id))}
            onCheckedChange={() =>
              setRightSelected((prev) =>
                prev.includes(Number(row.asset_id))
                  ? prev.filter((id) => id !== Number(row.asset_id))
                  : [...prev, Number(row.asset_id)]
              )
            }
          />
      ),
    },
    { key: "serial_number", label: "Serial Number", width: "w-[60px]" },
    { key: "asset_name", label: "Asset Name", width: "w-[80px]" },
    { key: "type_name", label: "Type", width: "w-[80px]" },
  ];


   // -------------------------
  // Scroll Area
  // -------------------------


   // -------------------------
  // Move logic
  // -------------------------
  const tableMaxHeight = 40 * 5;
  const moveRight = () => {
    const toMove = available.filter((a) =>
      leftSelected.includes(Number(a.asset_id))
    );
    if (!toMove.length) return;
    setSelected((prev) => [...prev, ...toMove]);
    setLeftSelected([]);
    setLeftAllSelected(false);
  };

  const moveLeft = () => {
    const toMove = selected.filter((a) =>
      rightSelected.includes(Number(a.asset_id))
    );
    if (!toMove.length) return;
    setSelected((prev) =>
      prev.filter((a) => !rightSelected.includes(Number(a.asset_id)))
    );
    setRightSelected([]);
    setRightAllSelected(false);
  };

  // -------------------------
  // Submit
  // -------------------------
  const handleSubmit = async () => {
    if (!selected.length) return alert("Select assets first");

    const payload = selected.map((a) => ({ asset_id: a.asset_id }));
    const result = await createOrder(payload);

    if (!result?.orderId) return alert("Failed to create order.");

    router.push(`/orderform/${result.orderId}`);
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="w-full max-w-5xl">
      <div className="p-6">
        <FieldGroup className="space-y-4">
          
          {/* Location */}
          <FieldSet>
            <FieldLegend>Create Recycling Order</FieldLegend>
            <FieldDescription>Select location</FieldDescription>
            <Field>
              <FieldLabel>Location</FieldLabel>
              <Combobox
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <ComboboxInput placeholder="Select location..." />
                <ComboboxContent>
                  <ComboboxList>
                    {locationOptions.map((loc) => (
                      <ComboboxItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
          </FieldSet>

          <FieldSeparator />

          {/* Tables */}
          <FieldSet>
            <FieldLegend>Select Assets</FieldLegend>
            <div className="overflow-x-auto">
              <div className="flex flex-col lg:flex-row gap-4 min-w-0 w-full">

                {/* Left Table */}
                <div className="flex-1 min-w-0">
                  <div className = "flex justify-end">
                    {(Object.keys(filters).length > 0 || sortKey || sortDirection) && (
                    <button
                      className="btn-outline cursor-pointer hover:underline transition mb-2"
                      onClick={clearAll}
                    >
                      Clear All
                    </button>
                    )}
                  </div>
                  <ScrollArea className="rounded-md" style={{ maxHeight: tableMaxHeight }}>
                    <Table
                      columns={availableColumns}
                      data={available}
                      filters={filters}
                      globalFilterOptions={globalFilterOptions}
                      onFilterChange={setFilters}
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSortChange={(key) => {
                        if (sortKey === key) {
                          setSortDirection((prev) =>
                            prev === "asc" ? "desc" : "asc"
                          );
                        } else {
                          setSortKey(key);
                          setSortDirection("asc");
                        }
                      }}
                      rowKey="asset_id"
                    />
                  </ScrollArea>
                </div>

                {/* Arrows */}
                <div className="flex flex-row lg:flex-col gap-2 justify-center items-center">
                  <Button onClick={moveRight}>→</Button>
                  <Button onClick={moveLeft}>←</Button>
                </div>

                {/* Right Table */}
                <div className="flex-1 min-w-0">
                  <ScrollArea className="rounded-md" style={{ maxHeight: tableMaxHeight }}>
                    <Table
                      columns={selectedColumns}
                      data={selected}
                      filters={{}}
                      globalFilterOptions={{}}
                      onFilterChange={() => {}}
                      onSortChange={() => {}}
                      rowKey="asset_id"
                    />
                  </ScrollArea>
                </div>

              </div>
            </div>
          </FieldSet>

          <FieldSeparator />

          {/* Submit */}
          <FieldSet>
            <Button onClick={handleSubmit} className="w-full">
              Verify Asset Selection
            </Button>
          </FieldSet>

        </FieldGroup>
      </div>
    </div>
  );
}