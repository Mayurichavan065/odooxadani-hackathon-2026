export const mockRequests = [
    {
      id: 1,
      subject: "Printer not working",
      status: "NEW",
      equipment_id: 1,
      equipment_name: "Printer 01",
      scheduled_date: "2024-01-01",
      type: "CORRECTIVE",
      assigned_to: { name: "Alex" },
    },
    {
      id: 2,
      subject: "Oil leakage",
      status: "IN_PROGRESS",
      equipment_id: 2,
      equipment_name: "CNC Machine",
      scheduled_date: "2023-12-01",
      type: "CORRECTIVE",
      assigned_to: { name: "Sam" },
    },
    {
      id: 3,
      subject: "Routine check",
      status: "REPAIRED",
      equipment_id: 2,
      equipment_name: "CNC Machine",
      scheduled_date: "2023-12-15",
      type: "PREVENTIVE",
      assigned_to: { name: "John" },
    },
  ];
  
  export const mockEquipment = [
    { id: 1, name: "Printer 01", serial_number: "PR-1001", department: "IT" },
    { id: 2, name: "CNC Machine", serial_number: "CNC-909", department: "Production" },
  ];
  