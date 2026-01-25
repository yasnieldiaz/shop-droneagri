'use client';

import { useEffect, useState } from 'react';

interface SerialRecord {
  id: string;
  productCode: string;
  productType: string;
  serialNumber: string;
  saleDate: string;
  createdAt: string;
  customer: {
    id: string;
    companyName: string;
    email: string;
    country: string;
  };
}

export default function AdminSerialRecordsPage() {
  const [records, setRecords] = useState<SerialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/admin/serial-records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      drone: 'Drone',
      battery: 'Bateria',
      charger: 'Cargador',
      controller: 'Control Remoto',
      spreader: 'Esparcidor',
      other: 'Otro',
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      drone: 'bg-blue-100 text-blue-800',
      battery: 'bg-green-100 text-green-800',
      charger: 'bg-yellow-100 text-yellow-800',
      controller: 'bg-purple-100 text-purple-800',
      spreader: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.productType === filterType;
    return matchesSearch && matchesType;
  });

  // Group records by customer
  const groupedByCustomer = filteredRecords.reduce((acc, record) => {
    const customerId = record.customer.id;
    if (!acc[customerId]) {
      acc[customerId] = {
        customer: record.customer,
        records: [],
      };
    }
    acc[customerId].records.push(record);
    return acc;
  }, {} as Record<string, { customer: SerialRecord['customer']; records: SerialRecord[] }>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registro de Equipos (SN)</h1>
        <p className="text-sm text-gray-500 mt-1">Equipos registrados por clientes B2B</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por S/N, codigo o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
        >
          <option value="all">Todos los tipos</option>
          <option value="drone">Drones</option>
          <option value="battery">Baterias</option>
          <option value="charger">Cargadores</option>
          <option value="controller">Controles</option>
          <option value="spreader">Esparcidores</option>
          <option value="other">Otros</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{records.length}</div>
          <div className="text-sm text-gray-500">Total Equipos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{records.filter(r => r.productType === 'drone').length}</div>
          <div className="text-sm text-gray-500">Drones</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{records.filter(r => r.productType === 'battery').length}</div>
          <div className="text-sm text-gray-500">Baterias</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{Object.keys(groupedByCustomer).length}</div>
          <div className="text-sm text-gray-500">Clientes</div>
        </div>
      </div>

      {/* Records grouped by customer */}
      <div className="space-y-6">
        {Object.values(groupedByCustomer).map(({ customer, records: customerRecords }) => (
          <div key={customer.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{customer.companyName}</h3>
                  <p className="text-sm text-gray-500">{customer.email} | {customer.country}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-red text-white">
                    {customerRecords.length} equipo(s)
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codigo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numero de Serie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Venta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(record.productType)}`}>
                          {getTypeLabel(record.productType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.productCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{record.serialNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.saleDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-4 text-gray-500">No hay equipos registrados</p>
        </div>
      )}
    </div>
  );
}
