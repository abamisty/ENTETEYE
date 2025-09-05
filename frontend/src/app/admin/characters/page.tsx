"use client";
import React, { useState, useEffect, useRef } from "react";
import { characterApi } from "@/api/characters";

const toast = {
  error: (msg: string) => alert(`Error: ${msg}`),
  success: (msg: string) => console.log(`Success: ${msg}`),
};

// Character interface matching your schema
interface Character {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  type: "human" | "animal" | "fantasy" | "robot" | "historical";
  ageGroup: "child" | "teen" | "adult" | "elder";
  personalityTraits?: string[];
  voiceSettings?: {
    pitch: number;
    speed: number;
    tone: string;
  };
  visualCustomization?: {
    colorScheme: string;
    outfit: string;
    accessories: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCharacterData {
  name: string;
  description: string;
  type?: string;
  ageGroup?: string;
  personalityTraits?: string[];
  voiceSettings?: {
    pitch: number;
    speed: number;
    tone: string;
  };
  visualCustomization?: {
    colorScheme: string;
    outfit: string;
    accessories: string[];
  };
}

const CharacterManagementPage = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAge, setFilterAge] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCharacterData>({
    name: "",
    description: "",
    type: "human",
    ageGroup: "adult",
    personalityTraits: [],
    voiceSettings: {
      pitch: 50,
      speed: 50,
      tone: "friendly",
    },
    visualCustomization: {
      colorScheme: "blue",
      outfit: "casual",
      accessories: [],
    },
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Character type options
  const characterTypes = [
    {
      value: "human",
      label: "Human",
      icon: "👤",
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "animal",
      label: "Animal",
      icon: "🦊",
      color: "bg-green-100 text-green-700",
    },
    {
      value: "fantasy",
      label: "Fantasy",
      icon: "🧙",
      color: "bg-purple-100 text-purple-700",
    },
    {
      value: "robot",
      label: "Robot",
      icon: "🤖",
      color: "bg-gray-100 text-gray-700",
    },
    {
      value: "historical",
      label: "Historical",
      icon: "🏛️",
      color: "bg-yellow-100 text-yellow-700",
    },
  ];

  const ageGroups = [
    { value: "child", label: "Child", icon: "🧒" },
    { value: "teen", label: "Teen", icon: "🧑" },
    { value: "adult", label: "Adult", icon: "👨" },
    { value: "elder", label: "Elder", icon: "👴" },
  ];

  const personalityOptions = [
    "Friendly",
    "Wise",
    "Energetic",
    "Calm",
    "Humorous",
    "Serious",
    "Creative",
    "Analytical",
    "Empathetic",
    "Confident",
    "Curious",
    "Patient",
  ];

  const colorSchemes = ["blue", "green", "purple", "red", "orange", "pink"];
  const outfits = [
    "casual",
    "formal",
    "adventure",
    "royal",
    "modern",
    "traditional",
  ];
  const accessories = [
    "hat",
    "glasses",
    "jewelry",
    "cape",
    "backpack",
    "staff",
  ];

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await characterApi.getAllCharacters();
      if (response.success) {
        setCharacters(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching characters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingCharacter(null);
    setFormData({
      name: "",
      description: "",
      type: "human",
      ageGroup: "adult",
      personalityTraits: [],
      voiceSettings: { pitch: 50, speed: 50, tone: "friendly" },
      visualCustomization: {
        colorScheme: "blue",
        outfit: "casual",
        accessories: [],
      },
    });
    setAvatarFile(null);
    setAvatarPreview("");
    setShowModal(true);
  };

  const openEditModal = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      description: character.description,
      type: character.type,
      ageGroup: character.ageGroup,
      personalityTraits: character.personalityTraits || [],
      voiceSettings: character.voiceSettings || {
        pitch: 50,
        speed: 50,
        tone: "friendly",
      },
      visualCustomization: character.visualCustomization || {
        colorScheme: "blue",
        outfit: "casual",
        accessories: [],
      },
    });
    setAvatarFile(null);
    setAvatarPreview(character.avatarUrl);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Name and description are required!");
      return;
    }

    if (!editingCharacter && !avatarFile) {
      toast.error("Avatar image is required!");
      return;
    }

    try {
      if (editingCharacter) {
        await characterApi.updateCharacter(
          { ...formData, id: editingCharacter.id },
          avatarFile || undefined
        );
      } else {
        await characterApi.createCharacter(formData, avatarFile!);
      }
      setShowModal(false);
      fetchCharacters();
    } catch (error) {
      console.error("Error saving character:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      try {
        await characterApi.deleteCharacter(id);
        fetchCharacters();
      } catch (error) {
        console.error("Error deleting character:", error);
      }
    }
  };

  const togglePersonalityTrait = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      personalityTraits: prev.personalityTraits?.includes(trait)
        ? prev.personalityTraits.filter((t) => t !== trait)
        : [...(prev.personalityTraits || []), trait],
    }));
  };

  const toggleAccessory = (accessory: string) => {
    setFormData((prev) => ({
      ...prev,
      visualCustomization: {
        ...prev.visualCustomization!,
        accessories: prev.visualCustomization?.accessories?.includes(accessory)
          ? prev.visualCustomization.accessories.filter((a) => a !== accessory)
          : [...(prev.visualCustomization?.accessories || []), accessory],
      },
    }));
  };

  const filteredCharacters = characters.filter((character) => {
    const matchesSearch =
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || character.type === filterType;
    const matchesAge = filterAge === "all" || character.ageGroup === filterAge;
    return matchesSearch && matchesType && matchesAge;
  });

  const getTypeConfig = (type: string) => {
    return characterTypes.find((t) => t.value === type) || characterTypes[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
          <span className="text-gray-600 text-lg">Loading characters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-[20px] sm:text-3xl font-bold text-gray-900">
                Character Management
              </h1>
              <p className="sm:visible hidden mt-1 text-sm text-gray-500">
                Create and manage course characters
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-primary-main hover:bg-primary-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add
            </button>
          </div>

          {/* Filters */}
          <div className="pb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm"
              >
                <option value="all">All Types</option>
                {characterTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm"
              >
                <option value="all">All Ages</option>
                {ageGroups.map((age) => (
                  <option key={age.value} value={age.value}>
                    {age.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No characters found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new character.
            </p>
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-main hover:bg-primary-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Character
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCharacters.map((character) => {
              const typeConfig = getTypeConfig(character.type);
              return (
                <div
                  key={character.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Character Avatar */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
                        <img
                          src={character.avatarUrl}
                          alt={character.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%23f3f4f6"/><text x="50%" y="50%" font-size="30" text-anchor="middle" dy=".3em" fill="%236b7280">${typeConfig.icon}</text></svg>`;
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {character.name}
                      </h3>
                      <div className="mt-2 flex items-center justify-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}
                        >
                          {typeConfig.icon} {typeConfig.label}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {
                            ageGroups.find(
                              (a) => a.value === character.ageGroup
                            )?.icon
                          }{" "}
                          {character.ageGroup}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Character Details */}
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {character.description}
                    </p>

                    {character.personalityTraits &&
                      character.personalityTraits.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {character.personalityTraits
                              .slice(0, 3)
                              .map((trait, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-main/10 text-primary-main"
                                >
                                  {trait}
                                </span>
                              ))}
                            {character.personalityTraits.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{character.personalityTraits.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 bg-gray-50 flex justify-between">
                    <button
                      onClick={() => openEditModal(character)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(character.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50  w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12  h-[80vh] overflow-y-scroll  max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4  border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCharacter ? "Edit Character" : "Create New Character"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main"
                        >
                          Choose File
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm"
                        placeholder="Enter character name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={4}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm"
                        placeholder="Describe your character..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm"
                        >
                          {characterTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age Group
                        </label>
                        <select
                          value={formData.ageGroup}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              ageGroup: e.target.value,
                            }))
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-main focus:border-primary-main sm:text-sm"
                        >
                          {ageGroups.map((age) => (
                            <option key={age.value} value={age.value}>
                              {age.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Personality Traits */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personality Traits
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                      {personalityOptions.map((trait) => (
                        <label key={trait} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              formData.personalityTraits?.includes(trait) ||
                              false
                            }
                            onChange={() => togglePersonalityTrait(trait)}
                            className="h-4 w-4 text-primary-main focus:ring-primary-main border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {trait}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Voice Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voice Settings
                    </label>
                    <div className="space-y-4 border border-gray-200 rounded-md p-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Pitch: {formData.voiceSettings?.pitch}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.voiceSettings?.pitch || 50}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              voiceSettings: {
                                ...prev.voiceSettings!,
                                pitch: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-main"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Speed: {formData.voiceSettings?.speed}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.voiceSettings?.speed || 50}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              voiceSettings: {
                                ...prev.voiceSettings!,
                                speed: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-main"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Tone
                        </label>
                        <select
                          value={formData.voiceSettings?.tone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              voiceSettings: {
                                ...prev.voiceSettings!,
                                tone: e.target.value,
                              },
                            }))
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-main focus:border-primary-main text-sm"
                        >
                          <option value="friendly">Friendly</option>
                          <option value="serious">Serious</option>
                          <option value="playful">Playful</option>
                          <option value="mysterious">Mysterious</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Visual Customization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visual Customization
                    </label>
                    <div className="space-y-4 border border-gray-200 rounded-md p-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-2">
                          Color Scheme
                        </label>
                        <div className="flex gap-2">
                          {colorSchemes.map((color) => (
                            <button
                              key={color}
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  visualCustomization: {
                                    ...prev.visualCustomization!,
                                    colorScheme: color,
                                  },
                                }))
                              }
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                formData.visualCustomization?.colorScheme ===
                                color
                                  ? "border-primary-main scale-110"
                                  : "border-gray-300"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Outfit
                        </label>
                        <select
                          value={formData.visualCustomization?.outfit}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              visualCustomization: {
                                ...prev.visualCustomization!,
                                outfit: e.target.value,
                              },
                            }))
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-main focus:border-primary-main text-sm"
                        >
                          {outfits.map((outfit) => (
                            <option key={outfit} value={outfit}>
                              {outfit}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-2">
                          Accessories
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {accessories.map((accessory) => (
                            <label
                              key={accessory}
                              className="flex items-center text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  formData.visualCustomization?.accessories?.includes(
                                    accessory
                                  ) || false
                                }
                                onChange={() => toggleAccessory(accessory)}
                                className="h-3 w-3 text-primary-main focus:ring-primary-main border-gray-300 rounded mr-1"
                              />
                              {accessory}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex justify-end space-x-3 pt-6 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-main hover:bg-primary-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main"
                >
                  {editingCharacter ? "Update Character" : "Create Character"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterManagementPage;
