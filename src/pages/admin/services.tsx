import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../lib/context';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { AddServiceModal } from '../../components/admin/add-service-modal';
import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Edit2, Plus, Check, Trash2 } from 'lucide-react';
import { Service } from '../../lib/types';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { services, addService, updateService, deleteService } = useBooking();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const handleDeleteClick = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const filteredServices = services.filter(
    (service) => filterCategory === 'all' || service.category === filterCategory
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'swimming-pool':
        return 'bg-blue-100 text-blue-800';
      case 'videoke':
        return 'bg-purple-100 text-purple-800';
      case 'cottages':
        return 'bg-green-100 text-green-800';
      case 'foods':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handlePriceUpdate = (serviceId: string, newPrice: number) => {
    updateService(serviceId, { price: newPrice });
    setEditingId(null);
  };

  const handleAddService = (newService: Service) => {
    addService(newService);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <AdminHeader />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
              <p className="text-gray-600 mt-2">Manage event add-on services and pricing</p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus size={20} />
              Add Service
            </Button>
          </div>

          {/* Categories Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { category: 'swimming-pool', label: 'Swimming Pool', count: services.filter((s) => s.category === 'swimming-pool').length },
              { category: 'videoke', label: 'Videoke', count: services.filter((s) => s.category === 'videoke').length },
              { category: 'cottages', label: 'Cottages', count: services.filter((s) => s.category === 'cottages').length },
              { category: 'foods', label: 'Food Catering', count: services.filter((s) => s.category === 'foods').length },
            ].map((cat) => (
              <Card key={cat.category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">{cat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800">{cat.count}</div>
                  <p className="text-xs text-gray-500 mt-2">Available services</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Categories</option>
              <option value="swimming-pool">Swimming Pool</option>
              <option value="videoke">Videoke</option>
              <option value="cottages">Cottages</option>
              <option value="foods">Food Catering</option>
            </select>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredServices.length === 0 ? (
              <div className="col-span-2 bg-white rounded-lg p-8 text-center border border-gray-200">
                <p className="text-gray-500">No services found</p>
              </div>
            ) : (
              filteredServices.map((service) => (
                <Card key={service.id} className="border-l-4 border-blue-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{service.name}</CardTitle>
                        <Badge className={`mt-2 ${getCategoryColor(service.category)}`}>
                          {getCategoryLabel(service.category)}
                        </Badge>
                      </div>
                      <Badge
                        className={service.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {service.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{service.description}</p>

                    {service.capacity && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Capacity</p>
                        <p className="text-lg font-semibold text-gray-800">{service.capacity} people</p>
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Price</p>
                      {editingId === service.id ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            min="0"
                          />
                          <button
                            onClick={() => handlePriceUpdate(service.id, editPrice)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            <Check size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <p className="text-2xl font-bold text-blue-600">₱{service.price}</p>
                          <button
                            onClick={() => {
                              setEditingId(service.id);
                              setEditPrice(service.price);
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    <Button
                      variant={service.available ? 'outline' : 'default'}
                      onClick={() => updateService(service.id, { available: !service.available })}
                      className="w-full"
                    >
                      {service.available ? 'Disable' : 'Enable'}
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(service.id)}
                      className="w-full mt-2"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Service
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddService}
      />

      {/* Delete Service Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone and all associated records will be permanently removed."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
      />
    </div>
  );
}
