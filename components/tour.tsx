"use client";
import { Button } from "./button";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Heart,
  MapPin,
  ShoppingBag,
  ScanLine,
} from "lucide-react";
import { Modal } from "./modal";
const steps = [
  {
    icon: Heart,
    title: "Chào bạn, tiệm mời chút ngọt!",
    body: "Cứ thong thả xem menu, chọn món và topping bạn thích. Bạn chưa cần để lại thông tin gì cả.",
    caption: "01 · Chọn điều mình thích",
  },
  {
    icon: ShoppingBag,
    title: "Gom món ngon vào một giỏ",
    body: "Tăng giảm số lượng thoải mái. Tiệm luôn kiểm tra lại còn hàng, hết hàng và giá mới nhất trước khi bạn đặt.",
    caption: "02 · Giỏ hàng luôn cập nhật",
  },
  {
    icon: MapPin,
    title: "Cho tiệm biết nơi giao nhé",
    body: "Đến bước đặt hàng mới cần tên, số điện thoại và địa chỉ. Bạn có thể cho phép ghim vị trí để tiệm dễ tìm hơn.",
    caption: "03 · Không cần đăng ký",
  },
  {
    icon: ScanLine,
    title: "Chuyển khoản, còn lại để tiệm",
    body: "Quét QR của tiệm, ghi mã đơn rồi gửi ảnh bill. Mở “Đơn của tôi” để thấy từng bước từ xác nhận đến giao tận tay.",
    caption: "04 · Theo dõi ngay tại đây",
  },
];
export function Tour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const item = steps[step];
  const Icon = item.icon;
  return (
    <Modal
      title="Một vòng quanh tiệm"
      onClose={onClose}
      footer={
        <div className="text-center [&>button:last-child]:mx-auto [&>button:last-child]:mt-2">
          <div
            className="mx-auto -mt-2.5 flex h-[50px] items-center justify-center gap-1.5 [&_button]:relative [&_button]:h-6 [&_button]:w-[23px] [&_button]:p-0 [&_button]:after:absolute [&_button]:after:top-2.5 [&_button]:after:left-[9px] [&_button]:after:size-[5px] [&_button]:after:rounded-[10px] [&_button]:after:bg-[#c5d6d9] [&_button]:after:content-[''] [&_button[aria-current=step]]:after:left-0.5 [&_button[aria-current=step]]:after:w-[19px] [&_button[aria-current=step]]:after:bg-blue [&_button]:enabled:active:scale-[.85] mobile:h-14 mobile:gap-0 mobile:[&_button]:size-11 mobile:[&_button]:after:top-[19px] mobile:[&_button]:after:left-[19px] mobile:[&_button]:after:size-1.5 mobile:[&_button[aria-current=step]]:after:left-[11px] mobile:[&_button[aria-current=step]]:after:w-[22px] short:h-11"
            aria-label={`Bước ${step + 1} trên 4`}
          >
            {steps.map((s, i) => (
              <button
                key={s.title}
                aria-label={`Bước ${i + 1}`}
                aria-current={i === step ? "step" : undefined}
                className="cursor-pointer overflow-hidden select-none transition-[transform,scale,translate,box-shadow,background-color,border-color,filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation [-webkit-tap-highlight-color:transparent] relative enabled:active:scale-[.96] enabled:active:translate-y-px"
                onClick={() => setStep(i)}
              />
            ))}
          </div>
          <Button
            variant="primary"
            className="w-full"
            onClick={() =>
              step === steps.length - 1 ? onClose() : setStep((s) => s + 1)
            }
          >
            {step === steps.length - 1 ? "Mình chọn món thôi!" : "Tiếp theo"}
            {step === steps.length - 1 ? (
              <Check size={18} />
            ) : (
              <ArrowRight size={18} />
            )}
          </Button>
          <Button variant="text" onClick={onClose}>
            Mình tự khám phá nhé
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center px-[34px] pt-[18px] pb-7 text-center [&>p:first-of-type]:mt-[5px] [&>p:first-of-type]:text-[8px] [&_h3]:mt-[7px] [&_h3]:mb-3.5 [&_h3]:max-w-[340px] [&_h3]:font-serif [&_h3]:text-[29px] [&_h3]:leading-[1.3] [&>p:last-child]:max-w-[360px] [&>p:last-child]:text-xs [&>p:last-child]:leading-[1.95] [&>p:last-child]:text-muted mobile:px-[22px] mobile:pt-3 mobile:pb-6 mobile:[&>p:first-of-type]:text-[10px] mobile:[&>p:first-of-type]:leading-[1.7] mobile:[&_h3]:leading-[1.25] mobile:[&>p:last-child]:text-sm mobile:[&>p:last-child]:leading-[1.85] short:[&_h3]:text-[25px]">
        <div className="relative grid h-[180px] w-[200px] place-items-center text-blue [&>svg]:relative [&>svg]:z-1 [&>svg]:rotate-[-7deg] mobile:h-[145px] mobile:w-[180px] short:mb-2 short:h-[70px] short:w-[150px] short:[&>svg]:size-12">
          <div className="absolute inset-x-[23px] inset-y-3 z-0 rotate-[-20deg] rounded-full bg-[#e7f0f0]" />
          <Icon size={62} strokeWidth={1.15} />
          <span className="absolute top-[26px] right-2.5 text-[33px] text-[#b5a480]">
            ✳
          </span>
        </div>
        <p className="mb-2.5 text-[9px] font-semibold tracking-[2px] text-blue uppercase mobile:mb-2 mobile:text-[10px] mobile:tracking-[1.4px]">
          {item.caption}
        </p>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </div>
    </Modal>
  );
}
