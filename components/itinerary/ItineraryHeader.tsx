'use client';

import { useState, useEffect } from 'react';
import { QuoteData, CityNight } from './ItineraryBuilder';
import CityNightsSelector from './CityNightsSelector';

interface Agent {
  id: number;
  company_name: string;
  contact_person: string;
  status: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  agent_id: number | null;
  source: string;
}

interface ItineraryHeaderProps {
  quoteData: QuoteData;
  setQuoteData: (data: QuoteData | ((prev: QuoteData) => QuoteData)) => void;
  isEditable: boolean;
}

export default function ItineraryHeader({
  quoteData,
  setQuoteData,
  isEditable
}: ItineraryHeaderProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [quoteType, setQuoteType] = useState<'direct' | 'agent'>('direct');

  // Fetch agents and clients on mount
  useEffect(() => {
    const fetchAgentsAndClients = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      const orgId = parsedUser.organizationId;

      // Fetch agents
      setLoadingAgents(true);
      try {
        const agentsRes = await fetch(`/api/agents/${orgId}?status=active`);
        if (agentsRes.ok) {
          const data = await agentsRes.json();
          setAgents(data.agents || []);
        }
      } catch (err) {
        console.error('Error fetching agents:', err);
      } finally {
        setLoadingAgents(false);
      }

      // Fetch clients
      setLoadingClients(true);
      try {
        const clientsRes = await fetch(`/api/clients/${orgId}`);
        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(data.clients || []);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoadingClients(false);
      }
    };

    if (isEditable) {
      fetchAgentsAndClients();
    }
  }, [isEditable]);

  // Update quote type based on agent selection
  useEffect(() => {
    if (quoteData.agent_id) {
      setQuoteType('agent');
    }
  }, [quoteData.agent_id]);

  // Filter clients based on quote type and selected agent
  const filteredClients = quoteType === 'agent' && quoteData.agent_id
    ? clients.filter(c => c.agent_id === quoteData.agent_id)
    : clients.filter(c => !c.agent_id || c.source === 'direct');

  const handleCityNightsChange = (cityNights: CityNight[]) => {
    // Auto-generate destination string from cities
    const destination = cityNights
      .filter(cn => cn.city)
      .map(cn => cn.city)
      .join(' & ');

    // Auto-calculate end date if start date is set
    let endDate = quoteData.end_date;
    if (quoteData.start_date && cityNights.length > 0) {
      const totalNights = cityNights.reduce((sum, cn) => sum + (cn.nights || 0), 0);
      if (totalNights > 0) {
        const start = new Date(quoteData.start_date);
        const end = new Date(start);
        end.setDate(start.getDate() + totalNights);
        endDate = end.toISOString().split('T')[0];
      }
    }

    setQuoteData(prev => ({
      ...prev,
      city_nights: cityNights,
      destination: destination || '',
      end_date: endDate
    }));
  };

  const formatDateRange = () => {
    if (!quoteData.start_date || !quoteData.end_date) return '';
    const start = new Date(quoteData.start_date);
    const end = new Date(quoteData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr} • ${diffDays} Days`;
  };

  if (isEditable) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm rounded-t-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              {quoteData.id ? 'Edit Itinerary' : 'Create New Itinerary'}
            </h1>
            {quoteData.quote_number && (
              <p className="text-sm text-gray-500">Quote: {quoteData.quote_number}</p>
            )}
          </div>

          {/* Quote Type Toggle */}
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setQuoteType('direct');
                setQuoteData(prev => ({ ...prev, agent_id: null }));
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                quoteType === 'direct'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Direct Client
            </button>
            <button
              type="button"
              onClick={() => setQuoteType('agent')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                quoteType === 'agent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Via Agent
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Agent Selection (only for agent type) */}
            {quoteType === 'agent' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Agent *
                </label>
                <select
                  value={quoteData.agent_id || ''}
                  onChange={(e) => {
                    const agentId = e.target.value ? parseInt(e.target.value) : null;
                    setQuoteData(prev => ({
                      ...prev,
                      agent_id: agentId,
                      client_id: null // Reset client when agent changes
                    }));
                  }}
                  className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select Agent...</option>
                  {loadingAgents ? (
                    <option disabled>Loading...</option>
                  ) : (
                    agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.company_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Client Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Client (Optional)
              </label>
              <select
                value={quoteData.client_id || ''}
                onChange={(e) => {
                  const clientId = e.target.value ? parseInt(e.target.value) : null;
                  const selectedClient = clients.find(c => c.id === clientId);
                  if (selectedClient) {
                    // Auto-fill customer info from client
                    setQuoteData(prev => ({
                      ...prev,
                      client_id: clientId,
                      customer_name: selectedClient.name || prev.customer_name,
                      customer_email: selectedClient.email || prev.customer_email
                    }));
                  } else {
                    setQuoteData(prev => ({ ...prev, client_id: clientId }));
                  }
                }}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select or enter new...</option>
                {loadingClients ? (
                  <option disabled>Loading...</option>
                ) : (
                  filteredClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.email ? `(${client.email})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={quoteData.customer_name}
                onChange={(e) => setQuoteData(prev => ({ ...prev, customer_name: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="John Doe"
              />
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={quoteData.customer_email}
                onChange={(e) => setQuoteData(prev => ({ ...prev, customer_email: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="john@example.com"
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={quoteData.customer_phone || ''}
                onChange={(e) => setQuoteData(prev => ({ ...prev, customer_phone: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="+1 234 567 8900"
              />
            </div>

            {/* City & Nights Selector */}
            <CityNightsSelector
              cityNights={quoteData.city_nights || []}
              onChange={handleCityNightsChange}
              isEditable={true}
            />

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={quoteData.start_date}
                onChange={(e) => {
                  const newStartDate = e.target.value;
                  let newEndDate = quoteData.end_date;

                  // Auto-calculate end date if city_nights is set
                  if (newStartDate && quoteData.city_nights && quoteData.city_nights.length > 0) {
                    const totalNights = quoteData.city_nights.reduce((sum, cn) => sum + (cn.nights || 0), 0);
                    if (totalNights > 0) {
                      const start = new Date(newStartDate);
                      const end = new Date(start);
                      end.setDate(start.getDate() + totalNights);
                      newEndDate = end.toISOString().split('T')[0];
                    }
                  }

                  setQuoteData(prev => ({ ...prev, start_date: newStartDate, end_date: newEndDate }));
                }}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* End Date - Auto-calculated, shown as read-only */}
            {quoteData.end_date && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  End Date (Auto-calculated)
                </label>
                <input
                  type="date"
                  value={quoteData.end_date}
                  readOnly
                  className="w-full px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm cursor-not-allowed"
                />
              </div>
            )}

            {/* Adults */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Adults *
              </label>
              <input
                type="number"
                required
                min="1"
                value={quoteData.adults}
                onChange={(e) => setQuoteData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Children */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Children
              </label>
              <input
                type="number"
                min="0"
                value={quoteData.children}
                onChange={(e) => setQuoteData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View Mode - Guest sees beautiful header with operator branding
  const primaryColor = (quoteData as any).primary_color || '#3B82F6';
  const secondaryColor = (quoteData as any).secondary_color || '#6366F1';
  const logoUrl = (quoteData as any).logo_url;
  const website = (quoteData as any).website;

  return (
    <div
      className="text-white relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
      }}
    >
      {/* Operator Logo - Top Left */}
      {logoUrl && (
        <div className="absolute top-6 left-6 z-10">
          {website ? (
            <a href={website} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={logoUrl}
                alt={quoteData.organization_name || 'Operator Logo'}
                className="h-12 md:h-16 w-auto object-contain bg-white/10 backdrop-blur-sm rounded-lg p-2"
              />
            </a>
          ) : (
            <img
              src={logoUrl}
              alt={quoteData.organization_name || 'Operator Logo'}
              className="h-12 md:h-16 w-auto object-contain bg-white/10 backdrop-blur-sm rounded-lg p-2"
            />
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
            {quoteData.quote_number}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {quoteData.destination}
          </h1>
          <p className="text-xl opacity-90 mb-6">
            {formatDateRange()}
          </p>
          <div className="flex items-center justify-center gap-6 opacity-90">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{quoteData.adults} Adult{quoteData.adults > 1 ? 's' : ''}</span>
            </div>
            {quoteData.children > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{quoteData.children} Child{quoteData.children > 1 ? 'ren' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Organization Info - White Label Branding */}
        {quoteData.organization_name && (
          <div className="mt-8 pt-8 border-t border-white/20 text-center">
            <p className="text-sm opacity-75 mb-2">Prepared by</p>
            <p className="text-xl font-bold">{quoteData.organization_name}</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-sm opacity-90">
              {quoteData.organization_email && (
                <a
                  href={`mailto:${quoteData.organization_email}`}
                  className="hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {quoteData.organization_email}
                </a>
              )}
              {(quoteData as any).organization_phone && (
                <a
                  href={`tel:${(quoteData as any).organization_phone}`}
                  className="hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {(quoteData as any).organization_phone}
                </a>
              )}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Website
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
