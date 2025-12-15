import React, { useState } from 'react';
import { LuSearch, LuMapPin, LuBed, LuBath, LuSquare, LuHeart, LuStar, LuWifi, LuCar, LuWind, LuWaves } from "react-icons/lu";

const HouseRentals = () => {
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const houses = [
    {
      id: 1,
      title: "Modern Villa with Pool",
      location: "Miami Beach, FL",
      price: 3500,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2800,
      rating: 4.9,
      reviews: 127,
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      features: ["WiFi", "Pool", "Parking", "AC"],
      description: "Stunning modern villa with ocean views, private pool, and luxury amenities. Perfect for families or groups."
    },
    {
      id: 2,
      title: "Cozy Downtown Apartment",
      location: "New York, NY",
      price: 2200,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      rating: 4.7,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      features: ["WiFi", "Parking", "AC"],
      description: "Beautiful apartment in the heart of downtown. Walking distance to all major attractions and restaurants."
    },
    {
      id: 3,
      title: "Lakefront Cottage",
      location: "Lake Tahoe, CA",
      price: 2800,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      rating: 4.8,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      features: ["WiFi", "Lake Access", "Parking"],
      description: "Charming cottage with stunning lake views. Enjoy water activities and peaceful mountain surroundings."
    },
    {
      id: 4,
      title: "Luxury Penthouse Suite",
      location: "Los Angeles, CA",
      price: 4500,
      bedrooms: 3,
      bathrooms: 3,
      sqft: 2400,
      rating: 5.0,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      features: ["WiFi", "Pool", "Parking", "AC"],
      description: "Exclusive penthouse with panoramic city views, rooftop terrace, and premium finishes throughout."
    },
    {
      id: 5,
      title: "Beach House Paradise",
      location: "Malibu, CA",
      price: 5200,
      bedrooms: 5,
      bathrooms: 4,
      sqft: 3500,
      rating: 4.9,
      reviews: 178,
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      features: ["WiFi", "Beach Access", "Pool", "Parking", "AC"],
      description: "Spectacular beachfront property with direct beach access, infinity pool, and breathtaking sunset views."
    },
    {
      id: 6,
      title: "Mountain Retreat Cabin",
      location: "Aspen, CO",
      price: 3200,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2200,
      rating: 4.8,
      reviews: 142,
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
      features: ["WiFi", "Parking", "Fireplace"],
      description: "Rustic yet modern cabin nestled in the mountains. Perfect for ski season or summer hiking adventures."
    }
  ];

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const filteredHouses = houses.filter(house =>
    house.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    house.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featureIcons = {
    "WiFi": <LuWifi className="w-4 h-4" />,
    "Pool": <LuWaves className="w-4 h-4" />,
    "Parking": <LuCar className="w-4 h-4" />,
    "AC": <LuWind className="w-4 h-4" />
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-blue-600">House Rentals</h1>
            
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <LuSearch className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by location or property name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Featured Properties</h2>
          <p className="text-gray-600">{filteredHouses.length} properties available</p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHouses.map(house => (
            <div
              key={house.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
              onClick={() => setSelectedHouse(house)}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={house.image}
                  alt={house.title}
                  className="w-full h-full object-cover hover:scale-110 transition duration-300"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(house.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100 transition"
                >
                  <LuHeart
                    className={`w-5 h-5 ${favorites.includes(house.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </button>
                <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ${house.price}/mo
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{house.title}</h3>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <LuMapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{house.location}</span>
                </div>

                <div className="flex items-center gap-4 mb-3 text-gray-700">
                  <div className="flex items-center">
                    <LuBed className="w-4 h-4 mr-1" />
                    <span className="text-sm">{house.bedrooms}</span>
                  </div>
                  <div className="flex items-center">
                    <LuBath className="w-4 h-4 mr-1" />
                    <span className="text-sm">{house.bathrooms}</span>
                  </div>
                  <div className="flex items-center">
                    <LuSquare className="w-4 h-4 mr-1" />
                    <span className="text-sm">{house.sqft} sqft</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {house.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                    >
                      {featureIcons[feature] || null}
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center">
                    <LuStar className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-sm font-semibold">{house.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({house.reviews})</span>
                  </div>
                  <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedHouse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedHouse(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-80">
              <img
                src={selectedHouse.image}
                alt={selectedHouse.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedHouse(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedHouse.title}</h2>
                  <div className="flex items-center text-gray-600">
                    <LuMapPin className="w-5 h-5 mr-1" />
                    <span>{selectedHouse.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">${selectedHouse.price}</div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                <div className="flex items-center">
                  <LuBed className="w-5 h-5 mr-2 text-gray-600" />
                  <div>
                    <div className="font-semibold">{selectedHouse.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <LuBath className="w-5 h-5 mr-2 text-gray-600" />
                  <div>
                    <div className="font-semibold">{selectedHouse.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <LuSquare className="w-5 h-5 mr-2 text-gray-600" />
                  <div>
                    <div className="font-semibold">{selectedHouse.sqft}</div>
                    <div className="text-sm text-gray-600">Square Feet</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedHouse.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3">Features & Amenities</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedHouse.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg"
                    >
                      {featureIcons[feature] || null}
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Book Now
                </button>
                <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
                  Contact Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseRentals;