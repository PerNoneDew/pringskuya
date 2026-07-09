'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Cake, Heart, Users } from 'lucide-react';
import { useBooking } from '../../lib/context';

interface EventTypeSelectorProps {
  onSelect: (eventType: 'birthday' | 'wedding' | 'normal') => void;
}

export function EventTypeSelector({ onSelect }: EventTypeSelectorProps) {
  const { eventTypePrices } = useBooking();

  const eventTypes = [
    {
      id: 'birthday',
      title: 'Birthday Party',
      description: 'Celebrate with us! Perfect for your special day',
      icon: Cake,
      color: 'bg-pink-100 text-pink-600',
      borderColor: 'border-pink-300',
    },
    {
      id: 'wedding',
      title: 'Wedding',
      description: 'Make your dream wedding a reality',
      icon: Heart,
      color: 'bg-red-100 text-red-600',
      borderColor: 'border-red-300',
    },
    {
      id: 'normal',
      title: 'Normal Event',
      description: 'Corporate events, seminars, gatherings',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      borderColor: 'border-blue-300',
    },
  ];

  const getEventPrice = (eventType: string): number => {
    const priceObj = eventTypePrices.find((p) => p.type === eventType);
    return priceObj?.price || 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {eventTypes.map((event) => {
        const Icon = event.icon;
        const price = getEventPrice(event.id);
        return (
          <Card key={event.id} className={`border-2 ${event.borderColor} hover:shadow-lg transition-shadow cursor-pointer`}>
            <CardHeader className="text-center">
              <div className={`${event.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className="w-8 h-8" />
              </div>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>{event.description}</CardDescription>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Starting Price:</p>
                <p className="text-2xl font-bold text-blue-600">₱{price.toLocaleString()}</p>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onSelect(event.id as 'birthday' | 'wedding' | 'normal')}
                className="w-full"
              >
                Choose Event
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
