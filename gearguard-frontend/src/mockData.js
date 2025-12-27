export const mockRequests = [
    {
      id: 1,
      subject: "Printer not working",
      status: "NEW",
      equipment_id: 1,
      equipment_name: "Printer 01",
      scheduled_date: "2024-01-01",
      assigned_to: { name: "Alex" },
    },
    {
      id: 2,
      subject: "Oil leakage",
      status: "IN_PROGRESS",
      equipment_id: 2,
      equipment_name: "CNC Machine",
      scheduled_date: "2023-12-01",
      assigned_to: { name: "Sam" },
    },
  ];
  
  export const mockEquipment = [
    {
      id: 1,
      name: "Printer 01",
      serial_number: "PR-1001",
      department: "IT",
    },
    {
      id: 2,
      name: "CNC Machine",
      serial_number: "CNC-909",
      department: "Production",
    },
  ];
  