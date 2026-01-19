"use client";

import { MobileBackHeader } from "@/components/layout/MobileBackHeader";
import { SellWatchMobileModal, SellWatchModal } from "@/components/seller";
import { Breadcrumbs, Button } from "@/components/ui";
import { ListingCard } from "@/components/user/ListingCard";
import { UserNav } from "@/components/user/UserNav";
import { useAuth } from "@/lib/context/AuthContext";
import { useMyListings } from "@/lib/hooks/useMyListings";
import { ListingStatus } from "@/types/nobile";
import { AlertCircle, CheckCircle2, Plus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type TabType = "ativo" | "rascunho" | "vendido" | "pausado" | "cancelado";

// Mapeamento de tabs para ListingStatus
const TAB_TO_STATUS: Record<TabType, ListingStatus> = {
  ativo: ListingStatus.ACTIVE,
  rascunho: ListingStatus.DRAFT,
  vendido: ListingStatus.SOLD,
  pausado: ListingStatus.PAUSED,
  cancelado: ListingStatus.CANCELLED,
};

type NotificationType = "success" | "error" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("ativo");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const { user } = useAuth();

  const searchParams = useSearchParams();

  const {
    listings,
    isLoading,
    error,
    stats,
    actionLoading,
    publishListing,
    pauseListing,
    reactivateListing,
    cancelListing,
    markAsSold,
    deleteListing,
    refresh,
  } = useMyListings(user);

  const hasPermission =
    user &&
    (user.role === "SELLER" || user.role === "ADMIN") &&
    user.isVerified === true;

  useEffect(() => {
    // Verifica se veio de uma origem autorizada
    const source = searchParams.get("source");
    const isFromAuthorizedSource =
      source === "header" || source === "user-menu";

    if (isFromAuthorizedSource && hasPermission) {
      // Detecta se é desktop ou mobile
      const isMobile = window.innerWidth < 1024; // lg breakpoint do Tailwind

      if (isMobile) {
        setIsMobileModalOpen(true);
      } else {
        setIsDesktopModalOpen(true);
      }

      // Remove o query parameter da URL sem recarregar a página
      const url = new URL(window.location.href);
      url.searchParams.delete("source");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, hasPermission]);

  // Adiciona notificação
  const addNotification = (
    type: NotificationType,
    title: string,
    message: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = { id, type, title, message };

    setNotifications((prev) => [...prev, notification]);

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  // Remove notificação
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Handler para publicar anúncio
  const handlePublish = async (id: number) => {
    try {
      await publishListing(id);
      addNotification(
        "success",
        "Anúncio publicado!",
        "Seu anúncio está agora visível para compradores."
      );
    } catch (error) {
      addNotification(
        "error",
        "Erro ao publicar",
        "Não foi possível publicar o anúncio. Tente novamente."
      );
    }
  };

  // Handler para pausar anúncio
  const handlePause = async (id: number) => {
    try {
      await pauseListing(id);
      addNotification(
        "success",
        "Anúncio pausado!",
        "Seu anúncio foi pausado e não está mais visível."
      );
    } catch (error) {
      addNotification(
        "error",
        "Erro ao pausar",
        "Não foi possível pausar o anúncio. Tente novamente."
      );
    }
  };

  // Handler para reativar anúncio
  const handleReactivate = async (id: number) => {
    try {
      await reactivateListing(id);
      addNotification(
        "success",
        "Anúncio reativado!",
        "Seu anúncio está novamente visível para compradores."
      );
    } catch (error) {
      addNotification(
        "error",
        "Erro ao reativar",
        "Não foi possível reativar o anúncio. Tente novamente."
      );
    }
  };

  // Handler para cancelar anúncio
  const handleCancel = async (id: number) => {
    if (!confirm("Tem certeza que deseja cancelar este anúncio?")) {
      return;
    }

    try {
      await cancelListing(id);
      addNotification(
        "success",
        "Anúncio cancelado!",
        "Seu anúncio foi cancelado com sucesso."
      );
    } catch (error) {
      addNotification(
        "error",
        "Erro ao cancelar",
        "Não foi possível cancelar o anúncio. Tente novamente."
      );
    }
  };

  // Handler para marcar como vendido
  const handleMarkAsSold = async (id: number) => {
    if (!confirm("Confirma que este relógio foi vendido?")) {
      return;
    }

    try {
      await markAsSold(id);
      addNotification(
        "success",
        "Marcado como vendido!",
        "Parabéns pela venda!"
      );
    } catch (error) {
      addNotification(
        "error",
        "Erro ao marcar como vendido",
        "Não foi possível atualizar o status. Tente novamente."
      );
    }
  };

  // Handler para deletar anúncio
  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Tem certeza que deseja deletar este anúncio? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      await deleteListing(id);
      addNotification(
        "success",
        "Anúncio deletado!",
        "O anúncio foi removido permanentemente."
      );
    } catch (error) {
      addNotification(
        "error",
        "Erro ao deletar",
        "Não foi possível deletar o anúncio. Tente novamente."
      );
    }
  };

  const handleModalSuccess = () => {
    refresh();
    addNotification(
      "success",
      "Anúncio criado!",
      "Seu anúncio foi criado com sucesso."
    );
  };

  const filteredListings = listings.filter(
    (listing) => listing.status === TAB_TO_STATUS[activeTab]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar anúncios</p>
          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // if (!hasPermission) {
  //   return (
  //     <div
  //       className="flex items-center justify-center bg-white px-6"
  //       style={{ minHeight: "calc(100vh - 120px)" }}
  //     >
  //       <div className="max-w-md text-center">
  //         <AlertCircle className="mx-auto mb-4 h-10 w-10 text-yellow-500" />

  //         <h2 className="text-xl font-medium text-gray-900 mb-2">
  //           Verificação necessária
  //         </h2>

  //         <p className="text-gray-600 mb-6">
  //           Para se tornar um vendedor na plataforma, você precisa solicitar a
  //           verificação de identidade. Esse processo garante mais segurança para
  //           compradores e vendedores.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-white lg:py-8">
      {/* Notificações */}
      <div className="fixed top-4 right-4 z-[200] space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-4 rounded-lg shadow-lg animate-slide-in ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200"
                : notification.type === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : notification.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-sm text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative flex lg:hidden">
        <MobileBackHeader title="Meus anúncios" />
        {hasPermission && (
          <button
            onClick={() => setIsMobileModalOpen(true)}
            aria-label="Novo Anúncio"
            className="absolute top-[8px] right-5 size-[42px] flex items-center justify-center bg-[#D5A60A] rounded-lg"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between flex-wrap max-w-7xl mx-auto px-8.5">
        <div>
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Meus anúncios" }]}
          />
          <h1 className="text-[32px] leading-[100%]">Meus anúncios</h1>
        </div>
        <div className="flex items-center gap-6">
          <UserNav />
          {hasPermission && (
            <Button
              onClick={() => setIsDesktopModalOpen(true)}
              variant="gold"
              className="w-[200px] h-[52px]"
            >
              Vender um relógio
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-3 lg:mt-12.5 px-5 lg:px-8">
        {/* Tabs de filtro */}
        <div>
          <div className="flex lg:px-4 overflow-x-auto overflow-y-hidden">
            <nav className="flex -mb-px">
              {(
                [
                  "ativo",
                  "rascunho",
                  "vendido",
                  "pausado",
                  "cancelado",
                ] as TabType[]
              ).map((tab) => {
                const count =
                  tab === "ativo"
                    ? stats.active
                    : tab === "rascunho"
                      ? stats.draft
                      : tab === "vendido"
                        ? stats.sold
                        : tab === "pausado"
                          ? stats.paused
                          : stats.cancelled;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                           lg:w-[150px] px-4 lg:px-6 py-3 text-sm font-medium whitespace-nowrap relative
                            border-b-2 transition-colors
                            ${
                              activeTab === tab
                                ? "border-transparent text-pb-500"
                                : "border-transparent text-gray-400 hover:text-gray-800 hover:border-gray-300"
                            }
                          `}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className="ml-2 text-xs text-gray-500">
                      ({count})
                    </span>
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#BE9F56]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Conteúdo das tabs */}
        <div className="bg-white rounded-lg shadow-sm px-2 py-4 lg:p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pb-500 mx-auto" />
              <p className="text-gray-600 mt-4">Carregando anúncios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-gray-900 font-medium mb-2">
                Erro ao carregar anúncios
              </p>

              <Button onClick={refresh}>Tentar novamente</Button>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl text-gray-900 mb-2">
                  {activeTab === "ativo" && "Você não tem anúncios ativos"}
                  {activeTab === "rascunho" && "Você não tem rascunhos"}
                  {activeTab === "vendido" &&
                    "Você ainda não vendeu nenhum relógio"}
                  {activeTab === "pausado" && "Você não tem anúncios pausados"}
                  {activeTab === "cancelado" &&
                    "Você não tem anúncios cancelados"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === "ativo" &&
                    "Crie um novo anúncio para começar a vender."}
                  {activeTab === "rascunho" &&
                    "Comece um novo anúncio e salve como rascunho."}
                  {activeTab === "vendido" &&
                    "Quando vender um relógio, ele aparecerá aqui."}
                  {activeTab === "pausado" &&
                    "Pause anúncios ativos para vê-los aqui."}
                  {activeTab === "cancelado" &&
                    "Anúncios cancelados aparecerão aqui."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
              {filteredListings.map((listing) => (
                //@ts-ignore
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onPublish={
                    activeTab === "rascunho"
                      ? () => handlePublish(listing.id)
                      : undefined
                  }
                  onPause={
                    activeTab === "ativo"
                      ? () => handlePause(listing.id)
                      : undefined
                  }
                  onReactivate={
                    activeTab === "pausado"
                      ? () => handleReactivate(listing.id)
                      : undefined
                  }
                  onCancel={
                    activeTab !== "vendido"
                      ? () => handleCancel(listing.id)
                      : undefined
                  }
                  onMarkAsSold={
                    activeTab === "ativo"
                      ? () => handleMarkAsSold(listing.id)
                      : undefined
                  }
                  onDelete={
                    activeTab === "rascunho" || activeTab === "cancelado"
                      ? () => handleDelete(listing.id)
                      : undefined
                  }
                  isPublishing={actionLoading.publish === listing.id}
                  isPausing={actionLoading.pause === listing.id}
                  isReactivating={actionLoading.reactivate === listing.id}
                  isCancelling={actionLoading.cancel === listing.id}
                  isMarkingAsSold={actionLoading.markAsSold === listing.id}
                  isDeleting={actionLoading.delete === listing.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Desktop - renderizado condicionalmente apenas para desktop */}
      <div className="hidden lg:block">
        <SellWatchModal
          isOpen={isDesktopModalOpen}
          onClose={() => setIsDesktopModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      </div>

      {/* Modal Mobile - renderizado condicionalmente apenas para mobile */}
      <div className="lg:hidden">
        <SellWatchMobileModal
          isOpen={isMobileModalOpen}
          onClose={() => setIsMobileModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
}
