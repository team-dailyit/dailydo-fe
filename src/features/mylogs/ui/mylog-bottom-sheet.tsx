'use client';

import { useState } from 'react';

import { useFileUpload } from '@/entities/file/api/file.queries';
import { MISSION_TOAST_MESSAGES } from '@/entities/missions';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Button } from '@/shared/ui/button/button';
import { FileInput } from '@/shared/ui/file-input';
import { Textarea } from '@/shared/ui/input';
import { useToast } from '@/shared/ui/toast';

interface MyLogBottomSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (photo: string | null, memo: string, localPreview?: string) => void;
  isPending?: boolean;
  initialPhoto?: string;
  initialMemo?: string;
  title?: string;
}

export const MyLogBottomSheet = ({
  open,
  setOpen,
  onSubmit,
  isPending = false,
  initialPhoto,
  initialMemo,
  title = '마이로그 작성',
}: MyLogBottomSheetProps) => {
  return (
    <BottomSheet.Root open={open} onOpenChange={setOpen}>
      <BottomSheet.Content>
        <MyLogBottomSheetContent
          onSubmit={onSubmit}
          isPending={isPending}
          initialPhoto={initialPhoto}
          initialMemo={initialMemo}
          title={title}
        />
      </BottomSheet.Content>
    </BottomSheet.Root>
  );
};

const MyLogBottomSheetContent = ({
  onSubmit,
  isPending,
  initialPhoto,
  initialMemo,
  title,
}: Pick<
  MyLogBottomSheetProps,
  'onSubmit' | 'isPending' | 'initialPhoto' | 'initialMemo' | 'title'
>) => {
  const [file, setFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhoto ?? null);
  const [localPreview, setLocalPreview] = useState<string | null>(
    initialPhoto ?? null,
  );
  const [memo, setMemo] = useState(initialMemo ?? '');
  const { mutateAsync: upload, isPending: isUploading } = useFileUpload();

  const handleFileChange = (selected: File | null) => {
    setFile(selected);
    if (!selected) {
      setPhotoUrl(null);
      setLocalPreview(null);
    } else {
      setLocalPreview(URL.createObjectURL(selected));
    }
  };
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const photo = file ? await upload(file) : photoUrl;
      onSubmit(photo, memo, localPreview ?? undefined);
    } catch {
      toast({
        message: `${MISSION_TOAST_MESSAGES.uploadError}`,
        type: 'error',
      });
    }
  };

  const isLoading = isUploading || isPending;
  const hasPhoto = file !== null || photoUrl !== null;

  return (
    <>
      <BottomSheet.Header className="pt-6">
        <BottomSheet.Title>{title}</BottomSheet.Title>
      </BottomSheet.Header>
      <BottomSheet.Body className="flex flex-col pt-4 pb-8">
        <span className="mb-1 text-sm font-medium">
          기억하고 싶은 순간이 있나요? <span className="text-green-500">*</span>
        </span>
        <div className="flex flex-col gap-12">
          <FileInput initialSrc={initialPhoto} onChange={handleFileChange} />
          <Textarea
            id="mylog"
            label="오늘을 한줄로 남겨 볼까요?"
            placeholder="최대 100자까지 입력 가능해요."
            description={`${memo.length}/100자`}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={100}
            isRequired={true}
          />
        </div>
      </BottomSheet.Body>
      <BottomSheet.Footer className="pt-0 pb-8">
        <div className="flex gap-2">
          <BottomSheet.Close>
            <Button variant="tertiary" type="button">
              취소하기
            </Button>
          </BottomSheet.Close>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!hasPhoto}
            type="button"
          >
            완료하기
          </Button>
        </div>
      </BottomSheet.Footer>
    </>
  );
};
