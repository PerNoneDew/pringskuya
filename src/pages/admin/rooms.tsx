import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminHeader } from '../../components/admin/header';
import { useBooking } from '../../lib/context';
import { Badge } from '../../components/ui/badge';
import { Edit2, Trash2, Plus, Upload, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import { showSuccessNotification, showErrorNotification, showWarningNotification, showInfoNotification } from '../../lib/notifications';
import { EditRoomModal } from '../../components/admin/edit-room-modal';
import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog';
import { Room } from '../../lib/types';

const statusColors: { [key: string]: string } = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-blue-100 text-blue-800',
  occupied: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
};

export default function RoomsPage() {
  const navigate = useNavigate();
  const { rooms, addRoom, updateRoom, deleteRoom } = useBooking();
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [searchType, setSearchType] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    type: 'single',
    pricePerNight: '',
    capacity: '',
    image: '',
  });

  // Add Room/Facility
  const handleAddRoom = () => {
    if (!newRoom.roomNumber || !newRoom.pricePerNight || !newRoom.capacity) {
      showErrorNotification({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    const roomData: Room = {
      id: Date.now().toString(),
      roomNumber: newRoom.roomNumber,
      type: newRoom.type as 'single' | 'double' | 'suite',
      pricePerNight: parseFloat(newRoom.pricePerNight.toString()),
      capacity: parseInt(newRoom.capacity.toString()),
      amenities: [],
      status: 'available',
      image: newRoom.image,
    };

    addRoom(roomData);

    showSuccessNotification({
      title: 'Room Added',
      description: `Room ${newRoom.roomNumber} has been added successfully.`,
    });
    setNewRoom({ roomNumber: '', type: 'single', pricePerNight: '', capacity: '', image: '' });
    setShowAddRoom(false);
  };

  // Open Edit Modal
  const handleOpenEditModal = (room: Room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  // Save Edited Room
  const handleSaveRoom = (updatedRoom: Room) => {
    updateRoom(updatedRoom.id, updatedRoom);
    showSuccessNotification({
      title: 'Room Updated',
      description: `Room ${updatedRoom.roomNumber} has been updated successfully.`,
    });
  };

  // Upload Images
  const handleUploadImages = (roomId: string) => {
    showInfoNotification({
      title: 'Upload Images',
      description: `Uploading images for room ${roomId}.`,
    });
  };

  // Update Room Status (Available / Occupied / Maintenance)
  const handleStatusChange = (id: string, newStatus: string) => {
    updateRoom(id, { status: newStatus as any });
    showSuccessNotification({
      title: 'Status Updated',
      description: `Room status changed to ${newStatus}.`,
    });
  };

  // Block Room for Maintenance
  const handleBlockMaintenance = (id: string) => {
    updateRoom(id, { status: 'maintenance' });
    showWarningNotification({
      title: 'Maintenance Mode',
      description: 'Room has been blocked for maintenance.',
    });
  };

  // Mark Room as Available
  const handleMarkAvailable = (id: string) => {
    updateRoom(id, { status: 'available' });
    showSuccessNotification({
      title: 'Room Available',
      description: 'Room is now available for booking.',
    });
  };

  // Delete/Deactivate Room - Open Dialog
  const handleDeleteClick = (id: string) => {
    setRoomToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (roomToDelete) {
      deleteRoom(roomToDelete);
      showErrorNotification({
        title: 'Room Deleted',
        description: 'The room has been permanently deleted.',
      });
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };

  // Search by Type
  const filteredRooms = rooms.filter(
    (room) => !searchType || room.type === searchType
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
              <button
                onClick={() => setShowAddRoom(!showAddRoom)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={18} />
                Add Room
              </button>
            </div>

            {/* Add Room Form */}
            {showAddRoom && (
              <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Room</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 101"
                        value={newRoom.roomNumber}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, roomNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Type
                      </label>
                      <select
                        value={newRoom.type}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                        <option value="suite">Suite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price/Night (₱) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 1500"
                        value={newRoom.pricePerNight}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, pricePerNight: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 2"
                        value={newRoom.capacity}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, capacity: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Image
                    </label>
                    {newRoom.image && (
                      <div className="mb-3">
                        <img
                          src={newRoom.image}
                          alt="Room preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setNewRoom({ ...newRoom, image: event.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload a JPG, PNG, or other image to display as the room preview</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddRoom}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Add Room
                    </button>
                    <button
                      onClick={() => setShowAddRoom(false)}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search by Type */}
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Room Type
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All Types</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">

              <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {filteredRooms.length} of {rooms.length} rooms
                </p>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Room #
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Price/Night
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Capacity
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Amenities
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room) => (
                      <tr
                        key={room.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-gray-800 font-bold text-lg">
                          {room.roomNumber}
                        </td>
                        <td className="px-6 py-4 text-gray-700 capitalize">
                          {room.type}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-semibold">
                          ₱{room.pricePerNight}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}
                        </td>
                        <td className="px-6 py-4 text-gray-700 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.slice(0, 2).map((amenity) => (
                              <Badge key={amenity} variant="outline">
                                {amenity}
                              </Badge>
                            ))}
                            {room.amenities.length > 2 && (
                              <Badge variant="outline">
                                +{room.amenities.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={statusColors[room.status]}>
                            {room.status === 'reserved' ? 'Reserved' : room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition flex items-center gap-1">
                                <MoreVertical size={16} />
                                Action
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleOpenEditModal(room)}>
                                <Edit2 size={16} className="mr-2 text-blue-600" />
                                <span>Edit Room</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUploadImages(room.id)}>
                                <Upload size={16} className="mr-2 text-green-600" />
                                <span>Upload Images</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleBlockMaintenance(room.id)}>
                                <span className="text-yellow-600 font-medium">Block Maintenance</span>
                              </DropdownMenuItem>
                              {room.status !== 'available' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleMarkAvailable(room.id)}>
                                    <span className="text-green-600 font-medium">Mark Available</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(room.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 size={16} className="mr-2" />
                                <span>Delete Room</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {filteredRooms.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No rooms found</p>
                ) : (
                  filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            Room {room.roomNumber}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">{room.type}</p>
                        </div>
                        <Badge className={statusColors[room.status]}>
                          {room.status === 'reserved' ? 'Reserved' : room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Price:</span>
                          <p className="font-semibold text-gray-800">
                            ₱{room.pricePerNight}/night
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Capacity:</span>
                          <p className="font-semibold text-gray-800">
                            {room.capacity} guests
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Amenities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {room.amenities.map((amenity, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition flex items-center justify-center gap-1">
                              <MoreVertical size={16} />
                              Action
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleOpenEditModal(room)}>
                              <Edit2 size={16} className="mr-2 text-blue-600" />
                              <span>Edit Room</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUploadImages(room.id)}>
                              <Upload size={16} className="mr-2 text-green-600" />
                              <span>Upload Images</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBlockMaintenance(room.id)}>
                              <span className="text-yellow-600 font-medium">
                                Block Maintenance
                              </span>
                            </DropdownMenuItem>
                            {room.status !== 'available' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleMarkAvailable(room.id)}>
                                  <span className="text-green-600 font-medium">
                                    Mark Available
                                  </span>
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(room.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 size={16} className="mr-2" />
                              <span>Delete Room</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        <EditRoomModal
          room={selectedRoom}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRoom(null);
          }}
          onSave={handleSaveRoom}
        />

        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          title="Delete Room"
          description="Are you sure you want to delete this room? This action cannot be undone and all associated data will be permanently removed."
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setRoomToDelete(null);
          }}
        />
      </div>
    </div>
  );
}
