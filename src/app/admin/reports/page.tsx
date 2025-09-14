'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Eye,
  Plus,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ShoppingCart,
  Store,
  TrendingUp
} from 'lucide-react'

interface Report {
  id: string
  name: string
  description: string
  type: 'sales' | 'customers' | 'restaurants' | 'products' | 'orders' | 'custom'
  format: 'pdf' | 'excel' | 'csv'
  status: 'pending' | 'generating' | 'completed' | 'failed'
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  parameters: Record<string, any>
  createdAt: string
  updatedAt: string
  lastGeneratedAt?: string
  fileSize?: number
  downloadUrl?: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: Report['type']
  icon: any
  color: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingReport, setEditingReport] = useState<Report | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'sales' as Report['type'],
    format: 'pdf' as Report['format'],
    frequency: 'once' as Report['frequency'],
    dateRange: 'last30days',
    restaurants: [] as string[],
    categories: [] as string[]
  })

  // Mock data
  const mockReports: Report[] = [
    {
      id: '1',
      name: 'Rapport Ventes Mensuel',
      description: 'Rapport complet des ventes du mois dernier',
      type: 'sales',
      format: 'pdf',
      status: 'completed',
      frequency: 'monthly',
      parameters: { dateRange: 'last_month', restaurants: ['all'] },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T08:45:00Z',
      lastGeneratedAt: '2024-01-20T08:45:00Z',
      fileSize: 2458960,
      downloadUrl: '/reports/sales-monthly-2024-01.pdf'
    },
    {
      id: '2',
      name: 'Analyse Clientèle',
      description: 'Segmentation et analyse du comportement client',
      type: 'customers',
      format: 'excel',
      status: 'completed',
      frequency: 'weekly',
      parameters: { dateRange: 'last_week', includeSegmentation: true },
      createdAt: '2024-01-18T14:20:00Z',
      updatedAt: '2024-01-20T09:30:00Z',
      lastGeneratedAt: '2024-01-20T09:30:00Z',
      fileSize: 1856432,
      downloadUrl: '/reports/customers-weekly-2024-01-20.xlsx'
    },
    {
      id: '3',
      name: 'Performance Restaurants',
      description: 'Évaluation des performances de tous les restaurants',
      type: 'restaurants',
      format: 'pdf',
      status: 'generating',
      frequency: 'once',
      parameters: { dateRange: 'last_quarter', includeComparisons: true },
      createdAt: '2024-01-20T16:15:00Z',
      updatedAt: '2024-01-20T16:20:00Z'
    },
    {
      id: '4',
      name: 'Inventaire Produits',
      description: 'État des stocks et produits populaires',
      type: 'products',
      format: 'csv',
      status: 'failed',
      frequency: 'daily',
      parameters: { includeAvailability: true, restaurants: ['1', '2', '3'] },
      createdAt: '2024-01-19T12:00:00Z',
      updatedAt: '2024-01-20T06:00:00Z'
    },
    {
      id: '5',
      name: 'Commandes Hebdomadaires',
      description: 'Suivi détaillé des commandes de la semaine',
      type: 'orders',
      format: 'excel',
      status: 'completed',
      frequency: 'weekly',
      parameters: { dateRange: 'current_week', includeDetails: true },
      createdAt: '2024-01-16T09:45:00Z',
      updatedAt: '2024-01-19T18:30:00Z',
      lastGeneratedAt: '2024-01-19T18:30:00Z',
      fileSize: 945621,
      downloadUrl: '/reports/orders-weekly-2024-01-19.xlsx'
    }
  ]

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'sales',
      name: 'Rapport de Ventes',
      description: 'Chiffre d\'affaires, tendances et analyses de vente',
      type: 'sales',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: 'customers',
      name: 'Analyse Clientèle',
      description: 'Données clients, segmentation et comportements',
      type: 'customers',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 'restaurants',
      name: 'Performance Restaurants',
      description: 'Évaluation et comparaison des restaurants',
      type: 'restaurants',
      icon: Store,
      color: 'text-purple-600'
    },
    {
      id: 'orders',
      name: 'Suivi Commandes',
      description: 'Historique et statuts des commandes',
      type: 'orders',
      icon: ShoppingCart,
      color: 'text-orange-600'
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setReports(mockReports)
      setLoading(false)
    }, 500)
  }, [])

  const filteredReports = reports.filter(report => {
    return (
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType === '' || report.type === filterType) &&
      (filterStatus === '' || report.status === filterStatus)
    )
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingReport) {
      setReports(prev => prev.map(r => 
        r.id === editingReport.id 
          ? { 
              ...r, 
              name: formData.name,
              description: formData.description,
              type: formData.type,
              format: formData.format,
              frequency: formData.frequency,
              parameters: {
                dateRange: formData.dateRange,
                restaurants: formData.restaurants,
                categories: formData.categories
              },
              updatedAt: new Date().toISOString() 
            }
          : r
      ))
    } else {
      const newReport: Report = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        type: formData.type,
        format: formData.format,
        frequency: formData.frequency,
        status: 'pending',
        parameters: {
          dateRange: formData.dateRange,
          restaurants: formData.restaurants,
          categories: formData.categories
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setReports(prev => [...prev, newReport])
    }

    setShowModal(false)
    setEditingReport(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'sales',
      format: 'pdf',
      frequency: 'once',
      dateRange: 'last30days',
      restaurants: [],
      categories: []
    })
  }

  const handleEdit = (report: Report) => {
    setEditingReport(report)
    setFormData({
      name: report.name,
      description: report.description,
      type: report.type,
      format: report.format,
      frequency: report.frequency,
      dateRange: report.parameters.dateRange || 'last30days',
      restaurants: report.parameters.restaurants || [],
      categories: report.parameters.categories || []
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      setReports(prev => prev.filter(r => r.id !== id))
    }
  }

  const generateReport = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id 
        ? { ...r, status: 'generating', updatedAt: new Date().toISOString() }
        : r
    ))
    
    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === id 
          ? { 
              ...r, 
              status: 'completed',
              lastGeneratedAt: new Date().toISOString(),
              fileSize: Math.floor(Math.random() * 5000000) + 500000,
              downloadUrl: `/reports/generated-${id}-${Date.now()}.pdf`
            }
          : r
      ))
    }, 3000)
  }

  const downloadReport = (report: Report) => {
    if (report.downloadUrl) {
      // Simulate download
      const link = document.createElement('a')
      link.href = report.downloadUrl
      link.download = `${report.name.toLowerCase().replace(/\s+/g, '-')}.${report.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'generating': return <div className="loading-spinner w-4 h-4" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'generating': return 'Génération...'
      case 'completed': return 'Terminé'
      case 'failed': return 'Échec'
      default: return status
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary-600" />
            Gestion des Rapports
          </h1>
          <p className="text-gray-600">Génération et gestion des rapports personnalisés</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouveau Rapport
        </button>
      </div>

      {/* Quick Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTemplates.map((template) => {
          const Icon = template.icon
          return (
            <div key={template.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`h-6 w-6 ${template.color}`} />
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, type: template.type, name: template.name }))
                  setShowModal(true)
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Créer ce rapport →
              </button>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rapports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <FileText className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'generating').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Récurrents</p>
              <p className="text-2xl font-bold text-blue-600">
                {reports.filter(r => r.frequency !== 'once').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un rapport..."
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="sales">Ventes</option>
            <option value="customers">Clients</option>
            <option value="restaurants">Restaurants</option>
            <option value="orders">Commandes</option>
            <option value="products">Produits</option>
          </select>
          
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="generating">En cours</option>
            <option value="completed">Terminé</option>
            <option value="failed">Échec</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rapport
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fréquence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière génération
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.name}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{report.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">
                    {report.format}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.frequency === 'once' ? 'Unique' : 
                     report.frequency === 'daily' ? 'Quotidien' :
                     report.frequency === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <span className="text-sm text-gray-900">{getStatusText(report.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.lastGeneratedAt ? (
                      <div>
                        <div>{new Date(report.lastGeneratedAt).toLocaleDateString('fr-FR')}</div>
                        {report.fileSize && (
                          <div className="text-xs text-gray-500">{formatFileSize(report.fileSize)}</div>
                        )}
                      </div>
                    ) : (
                      'Jamais'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {report.status === 'completed' && report.downloadUrl && (
                      <button
                        onClick={() => downloadReport(report)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    
                    {(report.status === 'pending' || report.status === 'failed') && (
                      <button
                        onClick={() => generateReport(report.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Générer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEdit(report)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingReport ? 'Modifier le rapport' : 'Nouveau rapport'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du rapport
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Report['type'] }))}
                    >
                      <option value="sales">Ventes</option>
                      <option value="customers">Clients</option>
                      <option value="restaurants">Restaurants</option>
                      <option value="orders">Commandes</option>
                      <option value="products">Produits</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.format}
                      onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as Report['format'] }))}
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fréquence
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as Report['frequency'] }))}
                  >
                    <option value="once">Une fois</option>
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Période de données
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.dateRange}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateRange: e.target.value }))}
                  >
                    <option value="last7days">7 derniers jours</option>
                    <option value="last30days">30 derniers jours</option>
                    <option value="last_month">Mois dernier</option>
                    <option value="last_quarter">Trimestre dernier</option>
                    <option value="last_year">Année dernière</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingReport(null)
                      resetForm()
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {editingReport ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}